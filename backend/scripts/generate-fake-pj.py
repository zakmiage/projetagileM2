#!/usr/bin/env python3
"""
generate-fake-pj.py
Génère des factures HTML ultra-réalistes converties en PDF via xhtml2pdf,
puis les insère en BDD. Supprime les anciennes PJ fake avant de recréer.
"""
import os, sys, json, datetime, random
from pathlib import Path

# Windows: forcer l'encodage UTF-8 en stdout
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ── Dépendances ───────────────────────────────────────────────────────────────
try:
    import pymysql
    from xhtml2pdf import pisa
except ImportError as e:
    print(f"[ERREUR] Dépendance manquante : {e}")
    print("Installer : python -m pip install xhtml2pdf pymysql")
    sys.exit(1)

# ── Config BDD depuis le .env Node ───────────────────────────────────────────
def load_env(env_path):
    env = {}
    if not os.path.exists(env_path):
        return env
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

SCRIPT_DIR = Path(__file__).parent
ENV_PATH   = SCRIPT_DIR.parent / ".env"
env        = load_env(str(ENV_PATH))
UPLOADS    = SCRIPT_DIR.parent / "uploads"
UPLOADS.mkdir(exist_ok=True)

DB_CFG = {
    "host":     env.get("DB_HOST", "localhost"),
    "user":     env.get("DB_USER", "root"),
    "password": env.get("DB_PASSWORD", ""),
    "database": env.get("DB_NAME", "gestion_assos"),
    "charset":  "utf8mb4",
}

# ── Templates de factures réalistes ───────────────────────────────────────────
INVOICES = [
    # Event 1 — Gala KUBIK 2024
    dict(event_id=1, category="Lieu",          label="Location salle Le Rooftop",   amount=1200.00, vendor="Le Rooftop Bordeaux SAS",     siret="412 345 678 00021", iban="FR76 3000 4028 3700 0123 4567 891", date="2024-11-15", items=[("Location salle premium — soirée du 14 déc. 2024", 1, 1200.00)]),
    dict(event_id=1, category="Technique",     label="Sono & Éclairage",             amount=850.00,  vendor="AudioPro Sud-Ouest SARL",       siret="530 217 985 00014", iban="FR76 1027 8022 6300 0654 3210 987", date="2024-11-20", items=[("Pack sono + 4 enceintes JBL", 1, 450.00), ("Jeu de lumières DMX 16 canaux", 1, 280.00), ("Technicien son — 6h", 1, 120.00)]),
    dict(event_id=1, category="Personnel",     label="Barman freelance ×2",          amount=320.00,  vendor="EventStaff Bordeaux",           siret="819 456 321 00037", iban="FR76 2004 1010 0505 0013 3M02 606", date="2024-12-01", items=[("Prestation barman — 5h × 2 personnes × 32€/h", 10, 32.00)]),
    dict(event_id=1, category="Communication", label="Flyers 500 ex. A5 recto-verso",amount=95.00,   vendor="Imprimerie PrintFast Bordeaux",  siret="315 678 901 00052", iban="FR76 3000 6000 0112 3456 7890 189", date="2024-11-10", items=[("Impression 500 flyers A5 recto-verso 135g", 500, 0.19)]),
    # Event 2 — WEI 2024
    dict(event_id=2, category="Hébergement",   label="Domaine des Pins — 3 jours",   amount=3200.00, vendor="Domaine des Pins SARL",         siret="488 123 456 00099", iban="FR76 1400 9000 0170 0018 0009 062", date="2024-08-01", items=[("Nuitée vendredi (60 personnes × 18€)", 60, 18.00), ("Nuitée samedi (60 personnes × 18€)", 60, 18.00), ("Salle polyvalente + équipements", 1, 980.00)]),
    dict(event_id=2, category="Transport",     label="Location minibus ×2 — 3 jours",amount=680.00,  vendor="Hertz Bordeaux Gare",           siret="602 012 368 00043", iban="FR76 3000 3030 5678 9012 3456 789", date="2024-09-05", items=[("Location Peugeot Traveller 9 places — 3 jours", 2, 340.00)]),
    dict(event_id=2, category="Alimentation",  label="Courses alimentaires",          amount=420.00,  vendor="Métro Cash & Carry Bordeaux",   siret="056 804 0730 014",  iban="FR76 3006 6001 0001 2345 6789 011", date="2024-09-18", items=[("Viandes & charcuteries BBQ", 1, 180.00), ("Boissons (softs + eau)", 1, 110.00), ("Fruits, légumes, pain", 1, 80.00), ("Condiments & divers", 1, 50.00)]),
    # Event 3 — WES 2024
    dict(event_id=3, category="Alimentation",  label="Traiteur pauses café",          amount=180.00,  vendor="Délices Traiteur Bordeaux",     siret="789 654 123 00011", iban="FR76 2004 1010 0505 0123 4M02 606", date="2024-10-25", items=[("Pause café matin — 95 personnes × 1€", 95, 1.00), ("Pause café après-midi — 95 personnes × 0.90€", 95, 0.90)]),
    dict(event_id=3, category="Communication", label="Impression supports conférences",amount=65.00,  vendor="Imprimerie PrintFast Bordeaux",  siret="315 678 901 00052", iban="FR76 3000 6000 0112 3456 7890 189", date="2024-10-28", items=[("Programmes A4 recto-verso plastifiés", 100, 0.65)]),
    # Event 4 — Saint-Valentin 2025
    dict(event_id=4, category="Alimentation",  label="Traiteur dîner assis 50 pers.", amount=1500.00, vendor="Gascogne Traiteur & Réceptions", siret="421 333 777 00088", iban="FR76 3000 1234 5678 9012 3456 789", date="2025-01-20", items=[("Menu 3 services Saint-Valentin — par couvert", 50, 28.00), ("Service & mise en place", 1, 100.00), ("Location vaisselle fine", 1, 100.00)]),
    dict(event_id=4, category="Décoration",    label="Fleurs & décoration de table",  amount=180.00,  vendor="Fleurs de France Bordeaux",     siret="234 567 890 00065", iban="FR76 1870 6000 0104 5678 9012 345", date="2025-02-10", items=[("Roses rouges — composition par table × 10 tables", 10, 12.00), ("Bougies & accessoires décoratifs", 1, 60.00)]),
]

# ── Template HTML de facture ──────────────────────────────────────────────────
def make_invoice_html(inv: dict, invoice_num: str) -> str:
    date_fmt = datetime.datetime.strptime(inv["date"], "%Y-%m-%d").strftime("%d/%m/%Y")
    due_date  = (datetime.datetime.strptime(inv["date"], "%Y-%m-%d") + datetime.timedelta(days=30)).strftime("%d/%m/%Y")
    tva_rate  = 0.20
    ht        = inv["amount"]
    tva       = round(ht * tva_rate, 2)
    ttc       = round(ht + tva, 2)

    rows = ""
    for desc, qty, unit in inv["items"]:
        total = round(qty * unit, 2)
        rows += f"""
        <tr>
          <td class="desc">{desc}</td>
          <td class="center">{qty}</td>
          <td class="right">{unit:.2f} €</td>
          <td class="right bold">{total:.2f} €</td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  @page {{ size: A4; margin: 18mm 16mm 15mm 16mm; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; }}
  body {{ color: #1e293b; font-size: 9pt; line-height: 1.4; }}

  /* ── HEADER ── */
  .header {{ display: table; width: 100%; margin-bottom: 24pt; }}
  .vendor-block {{ display: table-cell; width: 55%; vertical-align: top; }}
  .invoice-block {{ display: table-cell; width: 45%; vertical-align: top; text-align: right; }}
  .vendor-name {{ font-size: 15pt; font-weight: bold; color: #4f46e5; margin-bottom: 4pt; }}
  .vendor-sub  {{ font-size: 8pt; color: #64748b; margin-bottom: 2pt; }}
  .invoice-title {{ font-size: 22pt; font-weight: bold; color: #4f46e5; margin-bottom: 4pt; }}
  .invoice-meta  {{ font-size: 8.5pt; color: #475569; margin-bottom: 2pt; }}

  /* ── SEPARATOR ── */
  .sep {{ border: none; border-top: 2px solid #4f46e5; margin: 14pt 0; }}

  /* ── PARTIES ── */
  .parties {{ display: table; width: 100%; margin-bottom: 20pt; }}
  .from-block, .to-block {{ display: table-cell; width: 50%; vertical-align: top; padding: 10pt 12pt; }}
  .from-block {{ background: #f8fafc; border-left: 3px solid #4f46e5; }}
  .to-block   {{ background: #f0fdf4; border-left: 3px solid #059669; padding-left: 20pt; }}
  .party-label {{ font-size: 7pt; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 4pt; font-weight: bold; }}
  .party-name  {{ font-size: 10pt; font-weight: bold; color: #1e293b; margin-bottom: 2pt; }}
  .party-sub   {{ font-size: 8pt; color: #475569; }}

  /* ── TABLE ── */
  table.items {{ width: 100%; border-collapse: collapse; margin-bottom: 14pt; }}
  table.items thead tr {{ background: #4f46e5; color: white; }}
  table.items thead th {{ padding: 7pt 8pt; font-size: 8pt; text-align: left; font-weight: bold; }}
  table.items thead th.right {{ text-align: right; }}
  table.items tbody tr:nth-child(even) {{ background: #f8fafc; }}
  table.items tbody td {{ padding: 6pt 8pt; font-size: 8.5pt; border-bottom: 1px solid #e2e8f0; vertical-align: top; }}
  .desc   {{ width: 55%; }}
  .center {{ width: 10%; text-align: center; }}
  .right  {{ width: 17.5%; text-align: right; }}
  .bold   {{ font-weight: bold; }}

  /* ── TOTAUX ── */
  .totals {{ width: 220pt; margin-left: auto; margin-bottom: 20pt; }}
  .total-row {{ display: table; width: 100%; padding: 4pt 0; border-bottom: 1px solid #f1f5f9; }}
  .total-label, .total-val {{ display: table-cell; font-size: 8.5pt; color: #475569; }}
  .total-val {{ text-align: right; }}
  .total-final {{ background: #4f46e5; padding: 7pt 10pt; display: table; width: 100%; border-radius: 4pt; margin-top: 6pt; }}
  .total-final .total-label {{ color: white; font-weight: bold; font-size: 9pt; }}
  .total-final .total-val   {{ color: white; font-weight: bold; font-size: 12pt; text-align: right; }}

  /* ── PAIEMENT ── */
  .payment-box {{ background: #eff6ff; border: 1px solid #bfdbfe; padding: 10pt 12pt; margin-bottom: 16pt; }}
  .payment-title {{ font-size: 8pt; font-weight: bold; color: #1d4ed8; margin-bottom: 4pt; text-transform: uppercase; letter-spacing: 0.06em; }}
  .payment-row {{ font-size: 8pt; color: #1e40af; margin-bottom: 2pt; }}

  /* ── FOOTER ── */
  .footer {{ border-top: 1px solid #e2e8f0; padding-top: 8pt; font-size: 7.5pt; color: #94a3b8; text-align: center; }}
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="vendor-block">
    <div class="vendor-name">{inv["vendor"]}</div>
    <div class="vendor-sub">SIRET : {inv["siret"]}</div>
    <div class="vendor-sub">TVA Intracommunautaire : FR{random.randint(10,99)}{inv["siret"].replace(" ","")[:9]}</div>
    <div class="vendor-sub">12 Rue du Commerce — 33000 Bordeaux</div>
    <div class="vendor-sub">contact@{inv["vendor"].lower().replace(" ","").replace("&","")[:18]}.fr • +33 5 56 00 12 34</div>
  </div>
  <div class="invoice-block">
    <div class="invoice-title">FACTURE</div>
    <div class="invoice-meta"><b>N° :</b> {invoice_num}</div>
    <div class="invoice-meta"><b>Date :</b> {date_fmt}</div>
    <div class="invoice-meta"><b>Échéance :</b> {due_date}</div>
    <div class="invoice-meta" style="margin-top:6pt; color:#4f46e5; font-weight:bold;">Réf. commande : KUBIK-{random.randint(1000,9999)}</div>
  </div>
</div>

<hr class="sep"/>

<!-- PARTIES -->
<div class="parties">
  <div class="from-block">
    <div class="party-label">Émetteur</div>
    <div class="party-name">{inv["vendor"]}</div>
    <div class="party-sub">12 Rue du Commerce</div>
    <div class="party-sub">33000 Bordeaux</div>
    <div class="party-sub">SIRET : {inv["siret"]}</div>
  </div>
  <div class="to-block">
    <div class="party-label">Destinataire</div>
    <div class="party-name">Association KUBIK — BDE KEDGE Bordeaux</div>
    <div class="party-sub">680 Cours de la Libération</div>
    <div class="party-sub">33405 Talence Cedex</div>
    <div class="party-sub">SIRET asso : 502 123 456 00017</div>
  </div>
</div>

<!-- OBJET -->
<p style="font-size:9pt; color:#475569; margin-bottom:12pt;">
  <b>Objet :</b> {inv["label"]} — Événement KUBIK « Événement id={inv["event_id"]} »
</p>

<!-- TABLEAU PRESTATIONS -->
<table class="items">
  <thead>
    <tr>
      <th class="desc">Désignation</th>
      <th style="text-align:center; width:10%">Qté</th>
      <th class="right" style="width:17.5%">P.U. HT</th>
      <th class="right" style="width:17.5%">Total HT</th>
    </tr>
  </thead>
  <tbody>
    {rows}
  </tbody>
</table>

<!-- TOTAUX -->
<div class="totals">
  <div class="total-row">
    <span class="total-label">Total HT</span>
    <span class="total-val">{ht:.2f} €</span>
  </div>
  <div class="total-row">
    <span class="total-label">TVA 20 %</span>
    <span class="total-val">{tva:.2f} €</span>
  </div>
  <div class="total-final">
    <span class="total-label">Total TTC</span>
    <span class="total-val">{ttc:.2f} €</span>
  </div>
</div>

<!-- PAIEMENT -->
<div class="payment-box">
  <div class="payment-title">Informations de règlement</div>
  <div class="payment-row"><b>Mode de paiement :</b> Virement bancaire sous 30 jours</div>
  <div class="payment-row"><b>IBAN :</b> {inv["iban"]}</div>
  <div class="payment-row"><b>BIC :</b> BNPAFRPPXXX</div>
  <div class="payment-row" style="margin-top:4pt; color:#64748b; font-size:7.5pt;">
    Tout retard de paiement entraîne des pénalités de retard au taux légal + 40 € d'indemnité forfaitaire de recouvrement (art. L441-10 C.com.).
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  {inv["vendor"]} — SIRET {inv["siret"]} — APE 7490B — RCS Bordeaux 123 456 789 •
  Facture soumise à TVA — Non assujetti à la TVA art. 293B du CGI si applicable
</div>

</body>
</html>"""

# ── Génération PDF via xhtml2pdf ──────────────────────────────────────────────
def html_to_pdf(html: str, out_path: Path) -> bool:
    with open(out_path, "wb") as f:
        result = pisa.CreatePDF(html.encode("utf-8"), dest=f, encoding="utf-8")
    return not result.err

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    conn = pymysql.connect(**DB_CFG)
    cursor = conn.cursor()

    # Récupérer le user pour created_by
    cursor.execute("SELECT id FROM users LIMIT 1")
    row = cursor.fetchone()
    created_by = row[0] if row else 1
    print(f"\nConnected to {DB_CFG['database']} | created_by = user {created_by}\n")

    # Nettoyage des anciennes PJ fake
    cursor.execute(
        "SELECT ba.id, ba.file_path FROM budget_attachments ba "
        "INNER JOIN budget_lines bl ON bl.id = ba.budget_line_id "
        "WHERE bl.event_id IN (1,2,3,4)"
    )
    old_atts = cursor.fetchall()
    if old_atts:
        print(f"  [DEL] Suppression de {len(old_atts)} ancienne(s) PJ...")
        for att_id, fp in old_atts:
            cursor.execute("DELETE FROM budget_attachments WHERE id = %s", (att_id,))
            try:
                p = Path(fp) if Path(fp).is_absolute() else UPLOADS.parent / fp
                if p.exists():
                    p.unlink()
            except Exception:
                pass

    # Nettoyage lignes budget auto-créées par le précédent script node
    # (on garde les lignes existantes et on associe les nouvelles PJ)

    generated = 0
    for inv in INVOICES:
        invoice_num = f"FAC-{inv['date'][:4]}-{random.randint(1000,9999)}"

        # Trouver ou créer la ligne budget
        cursor.execute(
            "SELECT id FROM budget_lines WHERE event_id=%s AND type='EXPENSE' AND category=%s LIMIT 1",
            (inv["event_id"], inv["category"])
        )
        line_row = cursor.fetchone()
        if line_row:
            line_id = line_row[0]
        else:
            cursor.execute(
                "INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, validation_status, created_by) "
                "VALUES (%s, 'EXPENSE', %s, %s, %s, %s, 1, 'SOUMIS', %s)",
                (inv["event_id"], inv["category"], inv["label"], inv["amount"], inv["amount"], created_by)
            )
            line_id = cursor.lastrowid
            print(f"  + Ligne budget créée : [event={inv['event_id']}] {inv['category']} — {inv['label']}")

        # Générer le PDF
        fname  = f"facture_{inv['event_id']}_{inv['category'].lower().replace(' ','_')[:20]}_{invoice_num}.pdf"
        fpath  = UPLOADS / fname
        html   = make_invoice_html(inv, invoice_num)

        if html_to_pdf(html, fpath):
            cursor.execute(
                "INSERT INTO budget_attachments (budget_line_id, file_name, file_path) VALUES (%s, %s, %s)",
                (line_id, fname, str(fpath))
            )
            generated += 1
            print(f"  ✓ [event={inv['event_id']}] {inv['label']:<40} {inv['amount']:>8.2f}€  →  {fname}")
        else:
            print(f"  ✗ [event={inv['event_id']}] Erreur PDF pour {inv['label']}")

    conn.commit()
    cursor.close()
    conn.close()
    print(f"\n✅ {generated}/{len(INVOICES)} factures PDF générées et liées en BDD.\n")

if __name__ == "__main__":
    main()
