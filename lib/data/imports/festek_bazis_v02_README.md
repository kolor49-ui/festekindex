# FESTÉKINDEX — FESTÉK BÁZIS v0.2

## Státusz
Production-candidate, hivatalos gyártói forrásokra épített curated master.

FONTOS: a v0.2 már nem demo seed, de még ne nevezd a Festék Bázis teljes és kimerítő termékkatalógusának addig,
amíg a gyártó aktuális katalógusának minden terméke soronként nincs reconciliálva.

## Fő változások v0.1 → v0.2
- 7016™: Brand candidate helyett ProductFamily.
- Nincs Product.brandId / familyId denormalizáció.
- Minden felvett Product explicit hasProduct relationnel kapcsolódik Brandhez vagy Familyhez.
- Magyar kanonikus Surface ID-k.
- Valódi Category ID + belongsToCategory élek.
- Source entitások és sourceIds.
- COROR Rapid / Industry rendszerkapcsolatok.
- Technology kind + Surface kapcsolatok.
- Manufacturer fact és FESTÉKINDEX editorial taxonomy külön kezelve.

## Import policy
- Ne írja felül automatikusan a már meglévő, frissebb/ellenőrzöttebb entitást.
- ID-alapú merge.
- Relation dedupe: fromEntityId + relationType + toEntityId.
- 7016 régi draft Brand rekordját NE publikáld. Migráld/archiváld; a v0.2 kanonikus entitása pf_7016.
- A product oldalak indexability-jét csak akkor kapcsold be, ha a minimum SEO-content threshold teljesül.
- Surface és Technology entitások a v0.2-ben indexable:false; később külön tartalmi küszöb alapján nyithatók indexelésre.
- V5 designhoz ne nyúlj.

## Validáció import után
1. tsc --noEmit
2. npm run build
3. npm run validate:graph
4. 0 orphan Product
5. 0 duplicate canonical relation
6. 0 relation to missing entity
7. 7016 Brand ne legyen published/indexable
8. pf_7016 legyen az aktív 7016 termékcsalád

## Következő lépés
Ha az import valid, csak utána épüljön a /cegek/festek-bazis-zrt Organization hub.
