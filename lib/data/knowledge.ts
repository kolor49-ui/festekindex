import type { KnowledgeArticle } from "./types";

/**
 * Knowledge articles — editorial professional content.
 * Body uses plain-text section headings (## …) separated by blank lines
 * for future Hub rendering. Current EntityDetailPage stores body as one block.
 */
export const knowledge: KnowledgeArticle[] = [
  {
    id: "know_airless_alapok",
    type: "knowledge",
    slug: "airless-festekszoras-alapok",
    name: "Airless festékszórás — alapok",
    shortDescription:
      "Mi az airless technológia, hogyan működik, mire használják, és milyen biztonsági szabályokat kell betartani.",
    body: `Az airless festékszórás olyan felhordási eljárás, amelyben a bevonóanyagot nagy nyomással, sűrített levegő nélkül porlasztják. A szivattyú a festéket vagy egyéb bevonatot nyomás alá helyezi, majd a tömlőn és a pisztolyon keresztül a fúvókán (tip) átpréseli. A fúvóka kis nyílásán kilépő anyag a nyomáskülönbség hatására apró cseppekre bomlik — ez a porlasztás. Az airless tehát nem a levegővel „szórja szét” a festéket, hanem a folyadéknyomással állítja elő a permetet.

## Hogyan működik?

Egy tipikus airless rendszer fő elemei a hajtás és a szivattyú, a nyomásszabályozás, a szűrés, a magasnyomású tömlő, a szórópisztoly és a cserélhető fúvóka. A szivattyú a tartályból vagy vödörből felhúzza a bevonóanyagot, és folyamatos, nagy nyomású folyadékáramot biztosít. A pisztoly gyakorlatilag a nyomás alatt álló anyag ki-be kapcsolója. Amikor a ravaszt meghúzzák, az anyag a tipen keresztül távozik; a tip furatának mérete és alakja határozza meg a kiáramló mennyiséget és a permetlegyező szélességét.

A nyomást nem érdemes „maximálisan” beállítani. Szakmai gyakorlat szerint a legkisebb olyan nyomást kell keresni, amelynél a permet már egyenletes, teljes legyezőt ad, és nincsenek ujjak, csíkok vagy „farok” a mintában. A túl magas nyomás növeli a túlpermetet (overspray), fokozza a tip és a gép kopását, és felesleges anyagveszteséget okoz.

## Mire használják?

Az airless eljárást gyakran választják nagyobb felületek, magasabb termelékenységű munkák és sokféle építőipari vagy ipari bevonat felhordására — például fal- és mennyezetfestékek, alapozók, bizonyos ipari bevonatok esetében. A gyorsabb lefedés és az egyenletesebb rétegképzés miatt kedvelt professzionális megoldás, ha a bevonat és a gép összehangolható.

Fontos korlátozás: nem minden bevonat airless-kompatibilis, és nem minden gép alkalmas minden anyagra. A viszkozitás, a töltőanyag-tartalom, a szűrési igény és a gyártói ajánlás döntő. A konkrét termék Műszaki adatlapját és a berendezés kezelési útmutatóját mindig ellenőrizni kell a felhordás előtt.

## Előnyei

Az airless előnye tipikusan a nagy anyagkibocsátás és a nagyobb felületek gyorsabb lefedése a hagyományos ecsetes vagy hengeres felhordáshoz képest. Mivel a porlasztás nem sűrített levegővel történik, más karakterű a permet, mint a klasszikus levegős (air spray) rendszereknél. Sok, magasabb viszkozitású építőipari bevonat is feldolgozható megfelelő tip–nyomás–szivattyú kombinációval. Megfelelő beállítással és technikával professzionális, egyenletes felület érhető el.

## Korlátai

Az airless nem minden munkára a legjobb választás. A túlpermet miatt alapos maszkolás és környezetvédelem szükséges. A tip és az anyag illesztése, a nyomásbeállítás, a szűrők tisztasága és a kezelő technikája erősen befolyásolja az eredményt. Kis, részletgazdag felületeken vagy olyan helyeken, ahol a permetszóródás nehezen kontrollálható, más felhordási mód (ecset, henger, finomabb levegős eljárás) előnyösebb lehet. A berendezés beruházási és karbantartási igénye is magasabb, mint az egyszerű kézi eszközöké. A tisztítás és a nyomásmentesítés kötelező munkafázis, nem „opcionális lépés”.

## Fúvóka és nyomás

A tip a rendszer egyik legfontosabb eleme: meghatározza a kiáramló anyagmennyiséget és a permetlegyező szélességét. A tipválasztás a felhordandó bevonathoz, a munkafelülethez és a gép kapacitásához igazodik; a túl kicsi vagy túl nagy furat egyaránt rontja a mintát. A nyomást a legkisebb, még megfelelő porlasztást adó értékre állítsuk — ha a minta szélein csíkok vagy hiányok vannak, fokozatosan emeljük, de ne ugorjunk azonnal a maximumra.

Univerzális nyomás- vagy tip-táblázatot itt szándékosan nem közlünk. A helyes értékek a bevonat gyártójának műszaki dokumentációjától, a tip típusától és a konkrét géptől függnek. Ha maximális nyomáson sem alakul ki megfelelő legyező, gyakran a tip mérete, kopása vagy az anyag–gép párosítás a hiba oka — nem feltétlenül „több nyomás” kell.

## Anyag és gép összehangolása

Jó airless eredmény csak akkor várható, ha a bevonat, a tip, a nyomás, a szivattyú teljesítménye, a szűrés, a tömlő és a környezeti feltételek együtt működnek. A márkanév önmagában nem garantál kompatibilitást. Vastagabb vagy töltöttebb anyagok nagyobb furatot, megfelelő szűrést és elegendő szivattyúkapacitást igényelhetnek. A szűrők eltömődése, a helytelen tip vagy a túl hosszú / kis átmérőjű tömlő szintén torzíthatja a mintát. A bevonat hígítását kizárólag a gyártói előírások szerint szabad végezni.

## Biztonság

Az airless rendszerek folyadéknyomása olyan magas lehet, hogy a permet vagy egy szivárgás a bőrt áttörve a szövetekbe juttathat anyagot. Ez a magasnyomású injekciós sérülés súlyos, gyakran alábecsült munkahelyi veszély: a bemeneti nyílás kicsinek tűnhet, a következmény mégis súlyos lehet. Soha ne irányítsuk a pisztolyt magunkra vagy másra; soha ne tegyük a kezet vagy ujjat a tip elé; a tipvédőt és a ravaszbiztosítót használjuk. Tisztítás, tipcsere vagy karbantartás előtt a rendszer nyomását a gyártói nyomásmentesítési eljárás szerint teljesen le kell engedni — a motor kikapcsolása önmagában nem mindig elég.

Gyanított injekció esetén azonnal orvosi ellátás szükséges; ne kezeljük „apró vágásként”. A kezelőorvosnak mondjuk el az anyagot és a körülményeket; a biztonsági adatlap (SDS) információi fontosak. Emellett a bevonat típusától függően kötelező a megfelelő egyéni védőeszköz, a szellőzés és az SDS szerinti óvintézkedések. A konkrét berendezés és bevonat biztonsági előírásait mindig a gyártói dokumentáció és a biztonsági adatlap alapján kell követni.

## Mikor jó választás?

Az airless gyakran akkor éri meg, ha nagyobb felületet kell gyorsan, egyenletesen lefedni; a bevonat airless-kompatibilis; a maszkolás és a munkakörnyezet megoldható; a kezelő ismeri a tip–nyomás beállítást; és a gép kapacitása megfelel az anyagnak. Kis javításoknál, erősen tagolt részleteknél vagy olyan helyeken, ahol a túlpermet elfogadhatatlan, más felhordási mód lehet célszerűbb. A döntést mindig a konkrét bevonat műszaki adataira és a helyszíni feltételekre alapozzuk — nem általános „mindig airless” vagy „soha airless” szabályra.`,
    status: "published",
    indexable: true,
    seoTitle: "Airless festékszórás alapok | FESTÉKINDEX Tudástár",
    seoDescription:
      "Airless működés, tip és nyomás, felhasználási területek, korlátok és biztonság — szakmai összefoglaló.",
    sourceIds: [
      "src_graco_airless_basics_pdf",
      "src_graco_airless_components",
      "src_wagner_airless_guide",
      "src_worksafenb_airless_hazards",
      "src_ncbi_injection_injury",
    ],
    updatedAt: "2026-10-06",
    verifiedAt: "2026-10-06",
  },
  {
    id: "know_porfestek_vs_folyadek",
    type: "knowledge",
    slug: "porfestek-es-folyadek-bevonat",
    name: "Porfesték és folyékony bevonat — mikor melyik?",
    shortDescription:
      "Szakmai összevetés: mikor előnyös a porfesték, mikor a folyékony bevonatrendszer, és milyen szempontok döntik el a választást.",
    body: `A porfesték (powder coating) és a folyékony bevonat nem „jobb” vagy „rosszabb” abszolút értelemben. Mindkettő bevonástechnikai eszközkészlet, más folyamatlogikával, más beruházási és üzemeltetési feltételekkel. A helyes választás az aljzattól, a kívánt teljesítménytől, a gyártási környezettől, a darab geometriájától, a megjelenési elvárásoktól, a térhálósítás / száradás lehetőségeitől, a javíthatóságtól, a sorozatnagyságtól és a rendelkezésre álló technológiától függ.

## Alapvető technológiai különbség

A porfesték tipikusan száraz, finomra őrölt polimerpor, amelyet elektrosztatikusan (vagy más, ehhez kapcsolódó eljárással) visznek fel a munkadarabra, majd szabályozott körülmények között — leggyakrabban hőkezeléssel — térhálósítanak / összeolvasztanak összefüggő filmmé. A folyékony bevonatok oldószeres, vizes bázisú vagy reaktív (például kétkomponensű) rendszerek lehetnek; a filmképződés a kémiától függően párolgással, kémiai térhálósodással vagy ezek kombinációjával történik. A „folyékony = mindig oldószeres” egyszerűsítés tehát helytelen.

## Aljzat és folyamatfeltételek

A porfestéket hagyományosan vezetőképes, a térhálósítási hőmérsékletet elviselő aljzatokon — elsősorban fémeken — alkalmazzák ipari körülmények között. Léteznek speciális alacsonyabb hőmérsékletű vagy más technológiájú megoldások is, de a klasszikus kemencés porfestés továbbra is szorosan kötődik a hőálló, megfelelően előkészített fémalkatrészekhez. A folyékony bevonatok szélesebb aljzatspektrumon és változatosabb helyszíneken alkalmazhatók: építőipari felületek, helyszíni javítás, olyan darabok, amelyek nem férnek be kemencébe, vagy nem bírják a hőkezelést.

## Térhálósítás és üzemszervezés

A porfestés egyik meghatározó különbsége a szabályozott térhálósítási lépés: a bevonatot tipikusan szállítópályán vagy adagokban kemencébe (vagy más kontrollált hőkezelésbe) viszik. Ez befolyásolja az üzem elrendezését, az energiaigényt, a darabméretet és azt, hogy az aljzat elviseli-e a hőterhelést. A folyékony rendszerek száradási / térhálósodási igénye széles skálán mozog: van, amelyik környezeti körülmények között is filmképző, van, amelyik hőkezelést vagy szabályozott páratartalmat kíván. A folyamatot mindig a konkrét bevonatrendszer dokumentációja határozza meg — nem általános hőmérséklettáblázat.

## Anyagkihasználás és túlpermet

Ipari porfestő vonalakon a túlpermet gyakran visszanyerhető és — megfelelő színkezelés és szennyeződésmentesség mellett — visszavezethető a rendszerbe. Ez anyagkihasználási előnyt jelenthet a folyékony szórás sok formájához képest, ahol a túlpermet jellemzően hulladékká válik. A folyékony felhordás hatásfoka erősen függ a módszertől (például hagyományos szórás, elektrosztatikus folyékony szórás, mártás). Univerzális százalékos „mindig X% kihasználás” állítást itt nem teszünk: a tényleges érték a berendezéstől, a geometriától, a színváltásoktól és a visszanyerő rendszertől függ.

## VOC és környezeti szempontok

A porfestékek általában nem tartalmaznak hagyományos folyékony oldószerhordozót a felhordás során; emiatt a felhordási lépés VOC-terhelése jellemzően alacsonyabb, mint sok oldószeres folyékony rendszernél. Ez azonban nem egyenlő azzal, hogy a porfestés „környezetbarát” abszolút értelemben. A teljes környezeti lábnyomot befolyásolja a térhálósítás energiája, az előkezelés, a hulladék, a visszanyerés minősége, a kemenceemisszió és a konkrét formula. A folyékony oldalon a vizes bázisú és magas szárazanyag-tartalmú rendszerek, valamint a jobb felhordási hatásfok szintén csökkenthetik a VOC-kibocsátást. A döntést sematikus marketingmondatok helyett a teljes folyamatra kell alapozni.

## Megjelenés és filmképzés

Mindkét technológia képes magas színvonalú megjelenésre: szín, fényesség, textúra, speciális effektusok. A porfilmek gyakran egymenetes, vastagabb, egyenletesebb ipari dekoratív / védőréteget adnak, de a pontos filmvastagság és a megjelenés a rendszertől függ. A folyékony bevonatoknál a rétegrend (alapozó, közbenső, fedő), a hígítás és a felhordási mód finomabb szabályozást tehet lehetővé bizonyos megjelenési célokra. Egyik sem „mindig szebb” a másiknál.

## Teljesítmény

A korrózióvédelem, a vegyszerállóság, az időjárásállóság és a mechanikai tartósság a teljes bevonatrendszertől függ: előkezelés, esetleges alapozó, bevonatkémia, filmvastagság, térhálósítás / száradás, aljzat és igénybevételi környezet. Sem a porfesték, sem a folyékony bevonat nem „mindig tartósabb”. Ugyanazon kémiacsaládon belül is nagy különbségek lehetnek beltéri és kültéri célú termékek között.

## Geometria és Faraday-ketreceffektus

Elektrosztatikus porfestésnél a mélyedések, éles belső sarkok és tagolt geometriák nehezebben fedhetők: a töltött szemcsék a mezővonalak mentén a könnyebben elérhető élekhez vonzódnak — ezt Faraday-ketreceffektusnak nevezik. A folyékony felhordásnak más geometriai és hozzáférési korlátai vannak (árnyékolás, túlfolyás, szórási szög). Komplex alkatrészeknél a technológia megválasztása mellett a szórási stratégia és a darabtervezés is számít.

## Javítás és helyszíni alkalmazás

A klasszikus porfestés elsősorban ellenőrzött üzemi folyamat. Helyszíni javítás, utólagos érintés, karbantartás vagy olyan szerkezetek bevonása, amelyek nem vihetők kemencébe, gyakran folyékony rendszerekkel oldható meg rugalmasabban. A pontos javítási eljárás mindig a bevonatrendszer előírásaitól függ; „bármilyen festék rákenhető” megoldás nem helyettesíti a rendszerkompatibilitást.

## Beruházás és sorozatnagyság

A porfestő vonal jellemzően előkezelést, kabint, visszanyerést, térhálósító berendezést és anyagmozgatást igényel. A folyékony rendszerekhez is szükséges a megfelelő felhordó eszköz, elszívás / szellőzés, száradási vagy térhálósítási kontroll, valamint a biztonsági és környezetvédelmi menedzsment. A sorozatgyártás, a színváltások gyakorisága és a darabméret döntően befolyásolja, melyik infrastruktúra térül meg. Konkrét beruházási összegeket itt nem közlünk.

## Porfesték lehet előnyös, ha…

- a darab fémes / hőálló, és belefér a szabályozott térhálósítási folyamatba;
- ipari, ismétlődő gyártásról van szó, ahol a visszanyerés és a stabil folyamat kihasználható;
- a kívánt film és megjelenés porrendszerrel jól teljesíthető;
- a felhordási lépés oldószerterhelésének csökkentése fontos szempont a teljes rendszerben.

## Folyékony bevonat lehet előnyös, ha…

- helyszíni, javítási vagy karbantartási felhordás kell;
- az aljzat nem bírja a porfestés hőkezelését, vagy a darab nem vihető vonalba;
- sokféle aljzatot / építőipari helyzetet kell lefedni;
- a rétegrend, a javíthatóság vagy a felhordási mód rugalmassága prioritás.

## A döntés előtt ellenőrizd…

1. Az aljzat anyagát, méretét és hőállóságát.
2. Az igényelt korróziós / környezeti teljesítményt és a teljes bevonatrendszert.
3. A megjelenési elvárásokat (szín, fény, textúra, toleranciák).
4. Gyári vagy helyszíni felhordás-e a cél.
5. A sorozatnagyságot, színváltásokat és a rendelkezésre álló infrastruktúrát.
6. A javíthatóságot és az életciklus-karbantartást.
7. A konkrét termékek műszaki adatlapját és biztonsági adatlapját.

Összefoglalva: a porfesték és a folyékony bevonat párhuzamos, nem egymást kizáró szakmai eszközök. A jó döntés a folyamat képességén és a bevonatrendszer követelményein múlik — nem márkaneveken vagy általános szlogeneken.`,
    status: "published",
    indexable: true,
    seoTitle: "Porfesték vs. folyékony bevonat | FESTÉKINDEX Tudástár",
    seoDescription:
      "Mikor válassz porfestéket, és mikor folyékony bevonatot? Aljzat, térhálósítás, VOC, javítás és döntési szempontok.",
    sourceIds: [
      "src_umich_powder_coating",
      "src_tci_powder_troubleshooting",
      "src_vitracoat_faraday",
      "src_epa_metal_furniture_coating",
      "src_epa_ctg_misc_metal",
      "src_cepe_powder_handling",
    ],
    updatedAt: "2026-10-06",
    verifiedAt: "2026-10-06",
  },
];
