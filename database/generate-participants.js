/**
 * generate-participants.js
 * Génère seed-participants.sql avec des registered_at étalés sur plusieurs jours.
 * Usage : node database/generate-participants.js
 */
const fs = require('fs');
const path = require('path');

// ─── Helpers ───────────────────────────────────────────────────────────────
function dateStr(base, plusDays, hours = 10) {
  const d = new Date(base);
  d.setDate(d.getDate() + plusDays);
  d.setHours(hours, Math.floor(Math.random() * 60), 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Étale n inscrits sur une fenêtre d'ouverture (simule une vraie vague)
function spread(eventId, people, openDate) {
  const waves = [
    { pct: 0.25, day: 0  },  // rush ouverture
    { pct: 0.30, day: 3  },  // vague principale
    { pct: 0.25, day: 7  },  // relance
    { pct: 0.15, day: 12 },  // dernières inscriptions
    { pct: 0.05, day: 18 },  // retardataires
  ];
  const rows = [];
  let idx = 0;
  for (const w of waves) {
    const count = Math.round(people.length * w.pct);
    const slice = people.slice(idx, idx + count);
    idx += count;
    for (let i = 0; i < slice.length; i++) {
      const p = slice[i];
      const ts = dateStr(openDate, w.day + Math.floor(i / 3), 9 + (i % 8));
      rows.push(
        `(${eventId},'${p.fn}','${p.ln}','${p.em}',${p.img},${p.dep},'${ts}')`
      );
    }
  }
  // reste non distribué
  for (const p of people.slice(idx)) {
    const ts = dateStr(openDate, 21, 14);
    rows.push(
      `(${eventId},'${p.fn}','${p.ln}','${p.em}',${p.img},${p.dep},'${ts}')`
    );
  }
  return rows;
}

const p = (fn, ln, em, img, dep) => ({ fn, ln, em, img, dep });

// ─── Données ───────────────────────────────────────────────────────────────

// EVENT 1 — Gala 2024 (cap 500, ouverture 45j avant : 2024-10-30)
const gala2024 = [
  p('Alice','Martin','alice.martin@etu.univ.fr',1,1),
  p('Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,0),
  p('David','Thomas','david.thomas@etu.univ.fr',1,1),
  p('Emma','Laurent','emma.laurent@etu.univ.fr',1,1),
  p('Florian','Robert','florian.robert@etu.univ.fr',0,1),
  p('Hugo','Michel','hugo.michel@etu.univ.fr',0,0),
  p('Gaëlle','Simon','gaelle.simon@etu.univ.fr',1,1),
  p('Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
  p('Julien','Martinez','julien.martinez@etu.univ.fr',1,1),
  p('Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
  p('Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
  p('Camille','Bernard','camille.bernard@etu.univ.fr',0,0),
  p('Thomas','Leblanc','thomas.leblanc@gmail.com',1,1),
  p('Mathilde','Durand','mathilde.durand@gmail.com',1,1),
  p('Arthur','Faure','arthur.faure@yahoo.fr',0,0),
  p('Léa','Garnier','lea.garnier@outlook.com',1,1),
  p('Antoine','Roux','antoine.roux@gmail.com',1,1),
  p('Pierre','Girard','pierre.girard@hotmail.fr',1,1),
  p('Sophie','Bonnet','sophie.bonnet@gmail.com',1,1),
  p('Nicolas','Perrin','nicolas.perrin@icloud.com',1,1),
  p('Clément','Marchand','clement.marchand@gmail.com',1,1),
  p('Noémie','Renard','noemie.renard@gmail.com',0,1),
  p('Romain','Brun','romain.brun@hotmail.fr',1,1),
  p('Laura','Charpentier','laura.charpentier@gmail.com',1,1),
  p('Alexis','Fontaine','alexis.fontaine@gmail.com',1,1),
  p('Jade','Vidal','jade.vidal@gmail.com',1,1),
  p('Louis','Denis','louis.denis@outlook.com',1,1),
  p('Sarah','Lambert','sarah.lambert@gmail.com',0,0),
  p('Tristan','Leroy','tristan.leroy@gmail.com',1,1),
  p('Pauline','Gauthier','pauline.gauthier@gmail.com',1,1),
  p('Yann','Chevalier','yann.chevalier@laposte.net',1,1),
  p('Ambre','Joly','ambre.joly@gmail.com',1,1),
];

// EVENT 2 — WEI 2024 (cap 150, ouverture 2024-06-01)
const wei2024 = [
  p('Alice','Martin','alice.martin@etu.univ.fr',1,1),
  p('Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,0),
  p('Camille','Bernard','camille.bernard@etu.univ.fr',0,1),
  p('Emma','Laurent','emma.laurent@etu.univ.fr',1,0),
  p('Gaëlle','Simon','gaelle.simon@etu.univ.fr',1,1),
  p('Julien','Martinez','julien.martinez@etu.univ.fr',1,0),
  p('Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
  p('Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
  p('Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
  p('Clément','Marchand','clement.marchand@gmail.com',1,1),
  p('Noémie','Renard','noemie.renard@gmail.com',0,0),
  p('Romain','Brun','romain.brun@hotmail.fr',1,1),
  p('Thomas','Leblanc','thomas.leblanc@gmail.com',1,1),
  p('Mathilde','Durand','m.durand@gmail.com',1,1),
  p('Pierre','Girard','p.girard@hotmail.fr',0,0),
  p('Sophie','Bonnet','s.bonnet@gmail.com',1,1),
  p('Nicolas','Perrin','n.perrin@icloud.com',0,1),
  p('Laura','Charpentier','laura.charpentier@gmail.com',1,1),
  p('Alexis','Fontaine','alexis.fontaine@gmail.com',1,1),
  p('Jade','Vidal','jade.vidal@gmail.com',0,0),
  p('Louis','Denis','louis.denis@outlook.com',1,1),
  p('Tristan','Leroy','tristan.leroy@gmail.com',1,1),
  p('Pauline','Gauthier','pauline.gauthier@gmail.com',1,1),
  p('Yann','Chevalier','yann.chevalier@laposte.net',0,0),
  p('Sarah','Lambert','sarah.lambert@gmail.com',1,1),
  p('Ethan','Roux','ethan.roux@gmail.com',1,0),
  p('Yasmine','Chaoui','yasmine.chaoui@gmail.com',0,0),
  p('Anthony','Barbier','anthony.barbier@gmail.com',1,1),
  p('Manon','Richard','manon.richard@gmail.com',1,1),
  p('Théo','Vigneron','theo.vigneron@etu.univ.fr',1,1),
  p('Clara','Rossignol','clara.rossignol@etu.univ.fr',1,0),
  p('François','Lacroix','francois.lacroix@gmail.com',0,0),
  p('Amandine','Picard','amandine.picard@gmail.com',1,1),
  p('Cédric','Colin','cedric.colin@gmail.com',1,1),
  p('Delphine','Boyer','delphine.boyer@yahoo.fr',0,1),
  p('Elisa','Blanc','elisa.blanc@gmail.com',1,1),
  p('Guillaume','Nicolas','guillaume.nicolas@gmail.com',1,1),
  p('Hélène','Roy','helene.roy@gmail.com',1,1),
  p('Jordan','Lemaire','jordan.lemaire@hotmail.fr',1,1),
  p('Léo','Guerin','leo.guerin@gmail.com',1,1),
  p('Nabil','Lefebvre','nabil.lefebvre@gmail.com',1,1),
  p('Océane','Blanchard','oceane.blanchard@gmail.com',1,1),
  p('Paul','Renaud','paul.renaud@icloud.com',1,1),
  p('Rachel','Dupuis','rachel.dupuis@gmail.com',1,1),
  p('Simon','Arnaud','simon.arnaud@etu.univ.fr',1,1),
  p('Théa','Bouchard','thea.bouchard@gmail.com',1,1),
  p('Nathan','Boyer','nathan.boyer@gmail.com',1,0),
  p('Chloé','Vincent','chloe.vincent@gmail.com',0,0),
];

// EVENT 3 — WES 2024 (cap 80, ouverture 2024-09-15)
const wes2024 = [
  p('Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,1),
  p('David','Thomas','david.thomas@etu.univ.fr',1,1),
  p('Gaëlle','Simon','gaelle.simon@etu.univ.fr',1,1),
  p('Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
  p('Alice','Martin','alice.martin@etu.univ.fr',1,1),
  p('Emma','Laurent','emma.laurent@etu.univ.fr',1,1),
  p('Florian','Robert','florian.robert@etu.univ.fr',0,0),
  p('Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
  p('Paul','Bernard','paul.bernard@gmail.com',1,1),
  p('Chloé','Vincent','chloe.vincent2@gmail.com',0,0),
  p('Sonia','Girard','sonia.girard@gmail.com',1,1),
  p('Marc','Lambert','marc.lambert@gmail.com',1,0),
  p('Julie','Perrault','julie.perrault@gmail.com',0,0),
  p('Nicolas','Fabre','nicolas.fabre@hotmail.fr',1,1),
  p('Anaïs','Lefebvre','anais.lefebvre@gmail.com',1,1),
  p('Valentin','Berger','valentin.berger@gmail.com',0,1),
  p('Théa','Bouchard','thea.bouchard2@gmail.com',1,1),
  p('Juliette','Paquet','juliette.paquet@gmail.com',1,1),
  p('Maxime','Hebert','maxime.hebert@yahoo.fr',0,0),
  p('Agathe','Denis','agathe.denis@gmail.com',1,1),
  p('Bastien','Lebrun','bastien.lebrun@gmail.com',1,1),
  p('Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
];

// EVENT 4 — Saint-Valentin 2025 (cap 100, ouverture 2025-01-10)
const valentin2025 = [
  p('Camille','Bernard','camille.bernard@etu.univ.fr',1,1),
  p('Florian','Robert','florian.robert@etu.univ.fr',0,0),
  p('Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
  p('Alice','Martin','alice.martin@etu.univ.fr',1,1),
  p('Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
  p('Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
  p('Hugo','Michel','hugo.michel@etu.univ.fr',0,0),
  p('Sophie','Morel','sophie.morel@gmail.com',1,1),
  p('Nicolas','Petit','nicolas.petit@icloud.com',1,1),
  p('Elodie','Renard','elodie.renard@gmail.com',1,1),
  p('Raphael','Chevalier','raphael.chevalier@gmail.com',0,1),
  p('Amelie','Fontaine','amelie.fontaine@gmail.com',1,1),
  p('Julien','Dupre','julien.dupre@gmail.com',1,1),
  p('Marion','Girard','marion.girard@hotmail.fr',0,0),
  p('Lucas','Perrot','lucas.perrot@gmail.com',1,1),
  p('Gabrielle','Thomas','gabrielle.thomas@gmail.com',1,1),
  p('Romain','Klein','romain.klein@gmail.com',1,0),
  p('Antoine','Blanc','antoine.blanc@gmail.com',1,1),
  p('Chloe','Bourgeois','chloe.bourgeois@gmail.com',1,1),
  p('Victor','Charrier','victor.charrier@gmail.com',1,1),
  p('Theo','Rolland','theo.rolland@etu.univ.fr',1,1),
  p('Emma','Berthier','emma.berthier@gmail.com',1,1),
  p('Juliette','Masson','juliette.masson@yahoo.fr',1,1),
  p('Hugo','Colin','hugo.colin@gmail.com',1,1),
  p('Lea','Aubert','lea.aubert2@gmail.com',1,0),
];

// EVENT 5 — Tournoi 2025 (cap 30, ouverture 2025-09-01)
const tournoi2025 = [
  p('Alice','Martin','alice.martin@etu.univ.fr',1,1),
  p('Emma','Laurent','emma.laurent@etu.univ.fr',1,1),
  p('Hugo','Michel','hugo.michel@etu.univ.fr',1,1),
  p('Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
  p('Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
  p('David','Thomas','david.thomas@etu.univ.fr',1,1),
  p('Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,0),
  p('Alexis','Fontaine','alexis.fontaine@gmail.com',1,1),
  p('Camille','Aubert','camille.aubert@yahoo.fr',0,0),
  p('Romain','Brun','romain.brun2@hotmail.fr',1,1),
  p('Thomas','Gauthier','thomas.gauthier@gmail.com',1,1),
  p('Claire','Rousseau','claire.rousseau@gmail.com',1,1),
  p('Benoit','Lambert','benoit.lambert@gmail.com',0,1),
  p('Ambre','Joly','ambre.joly2@gmail.com',1,1),
  p('Maxime','Perrin','maxime.perrin@gmail.com',1,1),
  p('Oceane','Vidal','oceane.vidal@gmail.com',1,1),
  p('Elisa','Guerin','elisa.guerin@gmail.com',1,1),
  p('Mila','Pierre','mila.pierre@gmail.com',1,1),
  p('Julien','Faure','julien.faure@gmail.com',1,1),
  p('Zoé','Renaud','zoe.renaud@gmail.com',1,1),
];

// EVENT 6 — WEI 2026 (cap 120, ouverture 2026-04-01) — FUTUR
const wei2026 = [
  p('Alice','Martin','alice.martin@etu.univ.fr',1,1),
  p('Baptiste','Moreau','baptiste.moreau@etu.univ.fr',0,0),
  p('Camille','Bernard','camille.bernard@etu.univ.fr',0,0),
  p('David','Thomas','david.thomas@etu.univ.fr',1,1),
  p('Emma','Laurent','emma.laurent@etu.univ.fr',1,1),
  p('Florian','Robert','florian.robert@etu.univ.fr',0,0),
  p('Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
  p('Julien','Martinez','julien.martinez@etu.univ.fr',0,0),
  p('Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
  p('Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,0),
  p('Yasmine','Chaoui','yasmine.chaoui@gmail.com',0,0),
  p('Ethan','Roux','ethan.roux@gmail.com',1,0),
  p('Elodie','Bernard','elodie.bernard@gmail.com',0,0),
  p('Nathan','Garnier','nathan.garnier@gmail.com',1,0),
  p('Clara','Morin','clara.morin@gmail.com',0,0),
  p('Antoine','Dupont','antoine.dupont2@gmail.com',1,1),
  p('Theo','Hamelin','theo.hamelin@etu.univ.fr',1,0),
  p('Hugo','Denis','hugo.denis@gmail.com',1,1),
  p('Jules','Meyer','jules.meyer@gmail.com',1,0),
  p('Tristan','Fabre','tristan.fabre@gmail.com',1,1),
  p('Romain','Pichon','romain.pichon@gmail.com',1,0),
  p('Mathis','Renard','mathis.renard@gmail.com',1,0),
  p('Manon','Gilles','manon.gilles@gmail.com',0,0),
  p('Lena','Barrault','lena.barrault@gmail.com',0,0),
];

// EVENT 7 — Gala 2026 (cap 200, ouverture 2026-04-10) — FUTUR
const gala2026 = [
  p('Alice','Martin','alice.martin@etu.univ.fr',1,1),
  p('Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,1),
  p('Camille','Bernard','camille.bernard@etu.univ.fr',0,0),
  p('David','Thomas','david.thomas@etu.univ.fr',1,1),
  p('Emma','Laurent','emma.laurent@etu.univ.fr',0,0),
  p('Florian','Robert','florian.robert@etu.univ.fr',1,1),
  p('Gaëlle','Simon','gaelle.simon@etu.univ.fr',0,0),
  p('Hugo','Michel','hugo.michel@etu.univ.fr',0,0),
  p('Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
  p('Julien','Martinez','julien.martinez@etu.univ.fr',1,1),
  p('Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
  p('Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
  p('Jade','Bonnet','jade.bonnet@gmail.com',1,1),
  p('Louis','Girard','louis.girard@outlook.com',0,0),
  p('Manon','Richard','manon.richard@gmail.com',1,0),
  p('Nathan','Garnier','nathan.garnier2@gmail.com',1,1),
  p('Oceane','Blanchard','oceane.blanchard2@gmail.com',0,1),
  p('Paul','Renaud','paul.renaud2@gmail.com',1,1),
];

// EVENT 8 — Ski 2027 (cap 40, ouverture 2026-11-01) — FUTUR
const ski2027 = [
  p('David','Thomas','david.thomas@etu.univ.fr',1,1),
  p('Inès','Garcia','ines.garcia@etu.univ.fr',1,0),
  p('Alice','Martin','alice.martin@etu.univ.fr',1,1),
  p('Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
  p('Florian','Robert','florian.robert@etu.univ.fr',0,0),
  p('Maxime','Perrin','maxime.perrin2@gmail.com',1,1),
  p('Chloe','Fontaine','chloe.fontaine@gmail.com',1,0),
  p('Quentin','Morel','quentin.morel@gmail.com',0,0),
  p('Pauline','Vidal','pauline.vidal@outlook.com',1,1),
  p('Simon','Chevalier','simon.chevalier@gmail.com',1,1),
  p('Oceane','Gauthier','oceane.gauthier@gmail.com',0,0),
  p('Victor','Rousseau','victor.rousseau@protonmail.com',1,0),
];

// ─── Génération SQL ─────────────────────────────────────────────────────────
const blocks = [
  { id: 1, people: gala2024,    open: '2024-10-30', label: 'Gala 2024 (32 inscrits / 500)' },
  { id: 2, people: wei2024,     open: '2024-06-01', label: 'WEI 2024 (48 inscrits / 150)' },
  { id: 3, people: wes2024,     open: '2024-09-15', label: 'WES 2024 (22 inscrits / 80)' },
  { id: 4, people: valentin2025,open: '2025-01-10', label: 'Saint-Valentin 2025 (25 inscrits / 100)' },
  { id: 5, people: tournoi2025, open: '2025-09-01', label: 'Tournoi 2025 (20 inscrits / 30)' },
  { id: 6, people: wei2026,     open: '2026-04-01', label: 'WEI 2026 (24 inscrits / 120)' },
  { id: 7, people: gala2026,    open: '2026-04-10', label: 'Gala 2026 (18 inscrits / 200)' },
  { id: 8, people: ski2027,     open: '2026-11-01', label: 'Ski 2027 (12 inscrits / 40)' },
];

let sql = `-- =============================================================================
-- seed-participants.sql (généré par generate-participants.js)
-- ÉTAPE 2 : Participants avec registered_at étalés sur plusieurs jours
-- =============================================================================
USE gestion_assos;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE event_participants;
SET FOREIGN_KEY_CHECKS = 1;

`;

for (const b of blocks) {
  const rows = spread(b.id, b.people, b.open);
  sql += `-- EVENT ${b.id} — ${b.label}\n`;
  sql += `INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit, registered_at) VALUES\n`;
  sql += rows.join(',\n') + ';\n\n';
}

const outPath = path.join(__dirname, 'seed-participants.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`✅ ${outPath} généré (${blocks.reduce((s,b)=>s+b.people.length,0)} participants).`);
