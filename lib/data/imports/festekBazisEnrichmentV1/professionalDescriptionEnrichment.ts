/**
 * Product Professional Description v1 — structured Termékleírás from official FESTÉK BÁZIS pages/TDS.
 * Source-faithful professional sections; no Search ranking impact; no SEO policy change.
 */

import type { ProductProfessionalDescriptionEnrichment } from "./types";
import { catalogueClosureProfessionalDescriptionsV1 } from "./catalogueClosureProfessionalDescriptionsV1";

export const productProfessionalDescriptionEnrichmentsV1: ProductProfessionalDescriptionEnrichment[] = [
  {
    productId: "prod_7016_wall",
    sourceIds: ["src_7016_wall", "src_7016_wall_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: [
          "A 7016 Antracit Egyrétegű Beltéri Falfesték beltéri falfesték; vízpára- és légáteresztő tulajdonságot említ. Fogadó: gipszes/cementes vakolat, glett, fűrészporos és struktúra tapéta, diszperziós átvonás. Egy rétegben felhordva elfedheti a korábbi festés színeit a lap szerint; javasolt 1 vagy 2 réteg. Kiadósság glettelten: 10–11 m²/liter. Szín: antracit. Kiszerelés: 1 l, 2,5 l."
        ],
        sourceIds: ["src_7016_wall", "src_7016_wall_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: [
          "Laza részek és szennyeződés eltávolítása; hibák glettelése, csiszolás. Tapadás/egyenletes szívás: VALMOR Univerzális Mélyalapozó. Próbafestés."
        ],
        sourceIds: ["src_7016_wall", "src_7016_wall_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: [
          "Csak +10 °C felett. Ecset, henger, szórás; alapos keverés. Hígítás: max. 10% víz; fedőréteg max. 5% víz. Első réteg átszáradása után fedő. Átfesthetőség önmagával 25 °C-on: 4 óra — páratartalom hosszabbíthat. Szerszám: víz. Fagyveszélyes. Használat előtt Műszaki és Biztonsági adatlap."
        ],
        sourceIds: ["src_7016_wall", "src_7016_wall_tds"],
      },
      {
        heading: "Fontos korlátok és biztonság",
        paragraphs: [
          "EUH208 allergén izotiazolinonok. Gyermekektől elzárva; szembe/bőrre ne. VOC A/a max. 30 g/l. Nem tűzveszélyes, fagyveszélyes."
        ],
        sourceIds: ["src_7016_wall", "src_7016_wall_tds"],
      }
    ],
  },
  {
    productId: "prod_coror_aromatic",
    sourceIds: ["src_coror_aromatic"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A COROR Aromás Hígító poliuretán minőségű, nagy tisztaságú, vízmentes, nem regenerált hígító. A gyártói oldal szerint a COROR Klórkaucsuk Bevonat, a VALMOR Biztonságos Padló- és Jelölőfesték és a COROR Rapid Korróziógátló Alapozó felhordási konzisztencia-beállítására fejlesztették.", "Alkalmazható zsírtalanításra, festőszerszámok elmosására és lecsepegett festék eltávolítására is. Csak tiszta szénhidrogén komponenseket használnak fel a gyártáskor; a termék nem tartalmaz regenerált oldószereket."],
        sourceIds: ["src_coror_aromatic"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Szórással történő felhordáshoz általában több, ecsettel vagy hengerrel történő felhordáshoz kevesebb hígító szükséges. A hígítót állandó kevergetés mellett, kisebb részletekben adjuk a festékhez, a festék használati útmutatójában szereplő mennyiség eléréséig."],
        sourceIds: ["src_coror_aromatic"],
      },
    ],
  },
  {
    productId: "prod_coror_ind_enamel",
    sourceIds: ["src_coror_ind_enamel", "src_coror_ind_enamel_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A COROR INDUSTRY Ipari Zománc egy módosított alkid-akril bázisú, gyorsan száradó, jó fedőképességű korróziógátló adalékot tartalmazó zománcfesték, amely használható kül- és beltérben, vas és acélfelületek átvonó festésére. Előnyösen alkalmazható ipari termelésben acélszerkezetek átvonó bevonatának, egyéb gépek és berendezések fedő festékeként.", "Ecsetelhető, jól szórható megfelelő szóróberendezéssel."],
        sourceIds: ["src_coror_ind_enamel", "src_coror_ind_enamel_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["A felület legyen száraz, olajtól, zsírtól portól és egyéb piszoktól mentes. Használjuk alapozóként a COROR INDUSTRY korróziógátló alapozót. Tartsuk be az ISO 8501 és az ISO 12944 előírásait. Amennyiben kezelt felület áll rendelkezésre, annak tapadásának megfelelőségét ellenőrizni szükséges."],
        sourceIds: ["src_coror_ind_enamel", "src_coror_ind_enamel_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["A munkálatok megkezdése előtt a festéket alaposan fel kell keverni, a felhordási konzisztenciára hígítani. A COROR INDUSTRY ipari zománc festék ecsetelhető, jól szórható megfelelő szóróberendezéssel. A festékrétegek között ajánlott a hőmérséklettől, illetve levegő páratartalomtól függően 12-30 perc száradási időt biztosítani.", "Téli hidegben is alkalmazható, ugyanakkor az acélfelület hőmérséklete legalább legyen 3 °C-kal a harmatpont felett."],
        sourceIds: ["src_coror_ind_enamel", "src_coror_ind_enamel_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["selyemfényű"],
        sourceIds: ["src_coror_ind_enamel", "src_coror_ind_enamel_tds"],
      },
    ],
  },
  {
    productId: "prod_coror_ind_primer",
    sourceIds: ["src_coror_ind_primer", "src_coror_ind_primer_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A COROR INDUSTRY KORRÓZIÓGÁTLÓ ALAPOZÓ gyorsan száradó, jó fedőképességű, könnyen átvonható korróziógátló alapozó festék, amely használható kül- és beltérben, vas és acélfelületek alapozó festésére. Normál korróziós igénybevételnek kitett felületek alapozó festésére ajánljuk, ipari felhasználásra! Megfelelő berendezéssel szórható."],
        sourceIds: ["src_coror_ind_primer", "src_coror_ind_primer_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["MSZ-EN-ISO 12944-4 és MSZ-EN-ISO 8501-1 szabványoknak megfelelően. A felületet szakszerűen elő kell készíteni. Száraz, portól és szennyeződésektől mentes legyen. Minden olyan anyagot el kell távolítani, ami hátrányosan befolyásolja az új bevonat tapadását (zsír, szilikon, rozsda, reve, stb.).", "Minden visszamaradt anyagnak szilárdan kell tapadnia a felülethez, javasoljuk ilyen esetben a tapadásvizsgálat elvégzését."],
        sourceIds: ["src_coror_ind_primer", "src_coror_ind_primer_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["A munkálatok megkezdése előtt a festéket alaposan fel kell keverni. A COROR INDUSTRY KORRÓZIÓGÁTLÓ ALAPOZÓ alkalmazása során a festék rétegek között ajánlott a hőmérséklettől, illetve levegő páratartalomtól függően 12-30 perc száradási időt biztosítani. Téli hidegben is alkalmazható, ugyanakkor a fogadófelület hőmérséklete legalább legyen 3 °C-kal a harmatpont felett.", "A megfelelő védelem eléréséhez legalább 60-80 mikron száraz rétegvastagság szükséges. Próbafestés javasolt."],
        sourceIds: ["src_coror_ind_primer", "src_coror_ind_primer_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_coror_ind_primer", "src_coror_ind_primer_tds"],
      },
    ],
  },
  {
    productId: "prod_coror_ind_s31",
    sourceIds: ["src_coror_ind_s31", "src_coror_ind_s31_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A COROR Industry S-31 Hígító a COROR Industry termékcsalád festékeinek felhordási konzisztencia-beállítására szolgál. Alkalmazható zsírtalanításra, festőszerszámok elmosására és lecsepegett festék eltávolítására is."],
        sourceIds: ["src_coror_ind_s31", "src_coror_ind_s31_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["A hígítót állandó kevergetés mellett, kisebb részletekben adjuk a festékhez, a festék használati útmutatójában szereplő mennyiség eléréséig. A festés befejezése után, a doboz visszazárása előtt célszerű kevés hígítót önteni a maradék festék tetejére, a dobozban történő beszáradás megakadályozására."],
        sourceIds: ["src_coror_ind_s31", "src_coror_ind_s31_tds"],
      },
    ],
  },
  {
    productId: "prod_coror_rapid_aqua_enamel",
    sourceIds: ["src_coror_rapid_aqua_enamel", "src_coror_rapid_aqua_enamel_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A COROR Rapid Aqua Zománcfesték egy univerzális, korróziógátló adalékot tartalmazó alapozó és fedőfesték egyben, mely kül-, és beltérben egyaránt felhasználható számos különböző felület állagmegóvó és dekorációs festésére. Könnyen felhordható, gyorsan száradó, kiváló fedőképességű, cseppmentes bevonóanyag.", "Akril és uretán hibrid kötőanyag kombinációjának köszönhetően kiváló minőségű, rugalmas és tartós réteget képez. A festék szinte minden felülethez jól tapad, ellenáll az UV sugárzásnak, vízálló, erős védelmet biztosít az időjárás viszontagságaival szemben. A megszilárdult bevonat ellenáll az általános háztartási fertőtlenítő és tisztítószereknek.", "A védeni, díszíteni kívánt felület lehet acél, kovácsoltvas, alumínium, horganyzott acél, réz, műanyag, MDF bútorlap, kerámia, csempe, OSB, fa, zománcozott felület, beton, vakolat stb. Festhetőek pl. a következő tárgyak: konyhabútor, fürdőszobák függőleges csempeburkolata, nyílászárók, kapuk, kerítések, korlátok, kerti bútorok, csatorna, zártszelvény, redőny, PVC stb."],
        sourceIds: ["src_coror_rapid_aqua_enamel", "src_coror_rapid_aqua_enamel_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["A festendő felületről maradéktalanul el kell távolítani a szennyeződéseket, rozsdát, laza, nem hordképes részeket. A régi bevonatok eltávolításához használja a COROR Rapid Festéklemarót. Rozsdás felület esetén kültéren használjon COROR Rapid Korróziógátló Alapozót.", "Az oxidálódott régi alumínium és horganyzott felületek zsírtalanítás után közvetlenül festhetők. A fafelületekről távolítsa el a szennyeződéseket, gyantát, régi bevonatokat, majd dörzspapírral csiszolja át és portalanítsa. A kerámiafelületekről távolítsa el a szennyeződéseket, alaposan zsírtalanítsa, majd öblítse le vízzel és hagyja megszáradni.", "A műanyagfelületeket a festés előtt tisztítsa meg, végezzen finom csiszolást, majd portalanítást. Nem nedvszívó felületek festése esetén a VALMOR Hídképző Alapozó használata, illetve a felület érdesítése tovább erősíti a rétegek tapadását. A festéket a használat előtt alaposan fel kell keverni.", "A munka megkezdése előtt próbafestés elvégzése javasolt."],
        sourceIds: ["src_coror_rapid_aqua_enamel", "src_coror_rapid_aqua_enamel_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["A COROR Rapid Aqua Zománcfesték felhasználása során a festéshez szükséges alapismeretek szerint járjon el, hogy az Ön által kezelt felület megfelelő minőségű legyen. Fokozottan ügyeljen az élek és sarkok megfelelő bevonására, és a különböző felületek megfelelő előkészítésére.", "A munkálatokat csak 5–30 °C között végezze! A festék felhordható ecsettel, hengerrel és megfelelő szóró berendezéssel. Az elcseppenéseket azonnal, a szerszámokat a festést követően vízzel kell elmosni."],
        sourceIds: ["src_coror_rapid_aqua_enamel", "src_coror_rapid_aqua_enamel_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["selyem-matt"],
        sourceIds: ["src_coror_rapid_aqua_enamel", "src_coror_rapid_aqua_enamel_tds"],
      },
    ],
  },
  {
    productId: "prod_coror_rapid_enamel",
    sourceIds: ["src_coror_rapid_enamel", "src_coror_rapid_enamel_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A COROR Rapid Zománcfesték oldószeres, felhasználásra kész, selyemfényű zománc korróziógátló adalékkal. A gyártó szerint egy termékben alapozó és fedőréteg szerepét is betöltheti bel- és kültéren, ipari és városi környezetben.", "A Műszaki adatlap szerint többek között acélra, kovácsoltvasra, alumíniumra, horganyzott és nikkelezett acélra, műanyagra, rézre, OSB-re, fára, zománcozott felületre, jól tapadó rozsdára, betonra és vakolatra vihető. Rozsdás felületen legalább 2–3 réteg kötelező. Gyakori alkalmazási példák: kerítés- és kapuelemek, korlátok, kerti bútorok, csatornák, csövek és zártszelvények. C3 korróziós kategóriába sorolt, illetve savas, sós vagy lúgos páraterhelésű csarnok- és műhelyfelületek védelmére is jelöli a gyártó.", "A kötőanyag uretanizált alkid. A megszilárdult film a Műszaki adatlap szerint UV-álló és tartósan vízlepergető. Kiadósság: 9–11 m²/liter egy rétegben; általános javaslat két réteg."],
        sourceIds: ["src_coror_rapid_enamel", "src_coror_rapid_enamel_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["A Műszaki adatlap szerint a szennyeződéseket, a régi bevonatokat és a pergő rozsdát maradéktalanul el kell távolítani. Régi bevonatokhoz a gyártó a COROR Rapid Festéklemarót jelöli; rozsdaátalakító használata nem javasolt.", "Oxidálódott, régi alumínium- és horganyzott felület zsírtalanítás után közvetlenül festhető. Új, még fényes fémfelületet előbb érdesíteni kell. Munka előtt a festéket intenzíven keverje fel, és végezzen próbafestést."],
        sourceIds: ["src_coror_rapid_enamel", "src_coror_rapid_enamel_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["A munkát 5–30 °C között végezze. Ecsettel, hengerrel vagy megfelelő szóróberendezéssel hordható fel; ügyeljen az élek és sarkok rétegvastagságára. 25 °C körül a bevonat körülbelül 30 perc alatt porszáraz, körülbelül 2 óra alatt száraz; a páratartalom a száradást jelentősen módosíthatja.", "A gyártó szerint fémfelületeken 5–7 éves védelmi élettartam is elérhető megfelelő kivitelezés mellett, ha COROR Rapid Korróziógátló alapozó 2×40 µm és Rapid Zománc 2×40 µm száraz rétegvastagságban kerül fel — ez gyártói példaszám, nem feltétel nélküli garancia. A végleges fényesség körülbelül két hét alatt alakul ki. Hígításhoz és szerszámtisztításhoz elsősorban COROR Szintetikus Hígító javasolt; megfelelő minőségű lakkbenzin vagy nitrohígító is használható. Oldószeres termék: a részletes biztonsági előírásokat a hivatalos biztonsági adatlap tartalmazza; a Műszaki adatlap a munkakezdés előtt a biztonsági adatlap áttanulmányozását is előírja."],
        sourceIds: ["src_coror_rapid_enamel", "src_coror_rapid_enamel_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["selyemfényű"],
        sourceIds: ["src_coror_rapid_enamel", "src_coror_rapid_enamel_tds"],
      },
    ],
  },
  {
    productId: "prod_coror_rapid_primer",
    sourceIds: ["src_coror_rapid_primer", "src_coror_rapid_primer_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A COROR Rapid Korróziógátló Alapozó felhasználásra kész, oldószeres, matt fémalapozó bel- és kültérre. Cél: korrózióvédelem és a fedőfesték tapadásának előkészítése. A Műszaki adatlap szerint kovácsoltvas, acél, alumínium, horganyzott és réz idomokra vihető. A gyártó fogadófelületként előzőleg festett vagy zománcozott felületet, valamint foltokban megjelenő, jól tapadó rozsdát is említ — rozsdán legalább 2–3 réteg kötelező.", "Egy rétegben a gyártó hegeszthető bevonatot jelöl. Átfesthető szintetikus, nitro, aromás hígítású és vízbázisú festékekkel. Kötőanyag: uretanizált alkid. Kiadósság: 12–13 m²/liter 40 µm száraz rétegvastagságnál; javasolt rétegszám: kettő. Megfelelő kivitelezés mellett fedő nélkül a Műszaki adatlap fél évnél hosszabb primer-élettartamot említ; Rapid Zománccal (alapozó 2×40 µm + zománc 2×40 µm) 5–7 éves példaszám szerepel — ez gyártói példaszám, nem feltétel nélküli garancia."],
        sourceIds: ["src_coror_rapid_primer", "src_coror_rapid_primer_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["A Műszaki adatlap a szennyeződések, a régi bevonatok és a pergő rozsda maradéktalan eltávolítását írja elő. Régi bevonatokhoz a gyártó a COROR Rapid Festéklemarót jelöli; rozsdaátalakító használata nem javasolt. Régi, oxidálódott alumínium- és horganyzott felület a Műszaki adatlap szerint zsírtalanítás után közvetlenül átvonható; az új, még fényes fémet előbb érdesíteni kell. A Műszaki adatlap nem ad külön részletszabályt a jól tapadó, meghagyható régi bevonatra — a meghagyást ne feltételezze automatikusan. Intenzív felkeverés és próbafestés ajánlott."],
        sourceIds: ["src_coror_rapid_primer", "src_coror_rapid_primer_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Munkahőmérséklet: 5–30 °C. Ügyeljen az élek és sarkok rétegvastagságára. 25 °C körül COROR Szintetikus vagy Aromás Hígítóval / hígítás nélkül: körülbelül 20 perc érintésszáraz, körülbelül 2 óra száraz; 1. fokozat max. 1 óra, 5. fokozat max. 24 óra. Ha a fedő aromás hígítású, illetve COROR Klórkaucsuk vagy VALMOR Biztonságos Padló- és Jelölőfesték, a Műszaki adatlap szerint legalább 48 órát kell várni az átfestés előtt. Hígítás és szerszámtisztítás: elsősorban COROR Szintetikus vagy Aromás Hígító; megfelelő minőségű lakkbenzin vagy nitrohígító is. Oldószeres termék — részletes biztonsági előírások: hivatalos biztonsági adatlap."],
        sourceIds: ["src_coror_rapid_primer", "src_coror_rapid_primer_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_coror_rapid_primer", "src_coror_rapid_primer_tds"],
      }
    ],
  },
  {
    productId: "prod_coror_rapid_stripper",
    sourceIds: ["src_coror_rapid_stripper"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A COROR Festéklemaró gél műszaki megoldása megfelel a korunk egyre szigorodó műszaki követelményeinek. Markáns festékmaró képessége mellett mégis környezettudatos alkalmazás esetén környezetre nem veszélyes termék. Új és régi, esetleg sérült festékbevonatok eltávolítására szolgál fém, fa és ásványi felületekről.", "Megmarja a szintetikus, olaj, víz alapú, nitrocellulóz, epoxi, poliuretán, porszórt, 1K és 2 komponensű festékeket kül- és beltérben."],
        sourceIds: ["src_coror_rapid_stripper"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["A kezelendő felületről távolítsuk el a pergő szennyeződéseket. A munkálatok megkezdése előtt javasolt a próbafestés elvégzése."],
        sourceIds: ["src_coror_rapid_stripper"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["A kezelést csak +5 °C felett végezzük. A felület hőmérséklete max. 25 °C lehet. Alaposan keverjük fel a terméket, majd ecsettel hordjuk fel húsosan géles COROR Festékmarót a kezelendő felületre. 2 perc–2 óra (festék fajtától függően) időtartam elteltével távolítsuk el a fellazult réteget ronggyal vagy kaparó szerszámmal.", "Az eltávolítandó festék kötőanyag minőségétől függően egyszerre is elérheti a kívánt célt, de lehet, hogy a műveletet rétegenként kell megismételni. Az eltávolítás végeztével, szappanos vízzel, vagy hígítóval tisztítsa meg a felületet és száradás után megkezdheti a felület kezelését.", "Ne használja olyan felületeken, amik közvetlen emberi, állati élelmiszerrel érintkeznek, illetve gyermekbútorokon és játékokon. A festékmarót hígítani nem szükséges."],
        sourceIds: ["src_coror_rapid_stripper"],
      },
    ],
  },
  {
    productId: "prod_coror_synthetic",
    sourceIds: ["src_coror_synthetic", "src_coror_synthetic_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A COROR Szintetikus Hígító nagy tisztaságú, vízmentes, nem regenerált hígító. Jellemzően alkidgyanta alapú lakkok, festékek és olajfestékek felhordási konzisztencia-beállítására, zsírtalanításra, lecsepegett festék eltávolítására és festőszerszámok tisztítására szolgál.", "Elsősorban a VALMOR, FACTOR és COROR termékek felhordási konzisztencia-beállítására fejlesztették, amelyek termékleírásán hígításra lakkbenzin vagy szintetikus hígító szerepel. A termék nem tartalmaz regenerált oldószereket."],
        sourceIds: ["src_coror_synthetic", "src_coror_synthetic_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["A hígítót állandó kevergetés mellett, kisebb részletekben adjuk a festékhez, a festék használati útmutatójában szereplő mennyiség eléréséig."],
        sourceIds: ["src_coror_synthetic", "src_coror_synthetic_tds"],
      },
    ],
  },
  {
    productId: "prod_factor_aqua_glaze",
    sourceIds: ["src_factor_aqua_glaze", "src_factor_aqua_glaze_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A FACTOR Aqua Akril Vastaglazúr kül- és beltéri fafelületek (oromdeszka, fakerítés, lambéria, kerti bútor, ház stb.) UV-álló, hosszantartó védelmét biztosítja. Használatával dekoratív, áttetsző védőfilm hozható létre, mely kiemeli és látszatni engedi a fa felületének természetes erezetét.", "Akrilgyanta tartalmának köszönhetően a bevonat rugalmas, így követi a fa természetes mozgását, nem reped meg, nem pereg le, védi a fát az időjárás hatásaitól. Rendkívüli tapadásának köszönhetően alkalmas kemény és nemes fából készült termékek, valamint a már oldószer alapú lazúrral kezelt felületek átfestésére.", "A megszilárdult bevonat nyálnak, víznek, háztartási tisztítószereknek ellenáll, így nem veszélyezteti gyermekeink egészségét. A színeket képező pigmentek – részben a természetben előforduló ásványi oxidok – kiegyensúlyozott védelmet nyújtanak a nap káros sugarai (UVA/UVB) ellen.", "A FACTOR Aqua Akril Vastaglazúr színtelen filmje UV-álló, kültéri lakkrétegként használható."],
        sourceIds: ["src_factor_aqua_glaze", "src_factor_aqua_glaze_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["A festendő felületről távolítsuk el maradéktalanul a szennyeződéseket, régi bevonatokat, majd dörzspapírral csiszoljuk át és portalanítsuk le! Az esetleges gyantakiválásokat nitrohígítóval távolítsuk el! A lemosott részeken a hígító teljes száradása után szabad csak festeni.", "Kültéri felületek esetén javasoljuk a FACTOR AQUA IMPREGNÁLÓ ALAPOZÓ használatát. A festési munkálatok megkezdése előtt javasolt a próbafestés elvégzése."],
        sourceIds: ["src_factor_aqua_glaze", "src_factor_aqua_glaze_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["A munkálatokat csak +10 °C felett végezzük, a felület hőmérséklete max. 25 °C lehet! Alaposan keverjük fel a terméket, majd kezdjük meg a festést a fa szálirányával megegyező irányban! Használjunk puha vagy speciális vizes lazúrhoz használatos ecsetet! Az első réteg esetén 15%-os, a továbbiakban 10%-os hígítást javaslunk.", "A nagy időjárási terheléseknek kitett felületeknél 3 réteg felhordása javasolt. A festékrétegek felvitele között legalább 2 óra száradási időt biztosítsunk! A színek árnyalatban eltérhetnek a színkártya színeitől a fa alapszínének, szívóképességének és a festékek rétegszámának függvényében, így minden esetben próbafestés elvégzését javasoljuk.", "Festett fa nedvességtartalma maximum 12% lehet."],
        sourceIds: ["src_factor_aqua_glaze", "src_factor_aqua_glaze_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["selyemfényű"],
        sourceIds: ["src_factor_aqua_glaze", "src_factor_aqua_glaze_tds"],
      },
    ],
  },
  {
    productId: "prod_factor_aqua_parquet",
    sourceIds: ["src_factor_aqua_parquet", "src_factor_aqua_parquet_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A FACTOR Aqua Parkettalakk poliuretán és akrilgyanta bázisú, beltéri, felhasználásra kész lakk. A Műszaki adatlap szerint oldószer- és formaldehidmentes, szagtalan, vízzel hígítható, egykomponensű. Parketta és egyéb beltéri fa (bútor, tornaszer, lambéria, gerenda) lakkozására jelöli; korábbi lakk/festés (oldószeres is), valamint VALMOR flexibilis és csúszásmentes padlófestékek átvonására is.", "Ásványi felületek (tégla, kő, vakolat, beton, cserép), tapéta, papír, gipszkarton lakkjellegű bevonására, illetve csúszásmentes gresslap takaríthatóvá tételére is szerepel. Fényesség: matt, selyemfényű vagy magasfényű (színtelen). Kiadósság: 10–12 m²/liter egy rétegben. Javasolt 2–3 réteg; nagy terhelésnél 3 réteg."],
        sourceIds: ["src_factor_aqua_parquet", "src_factor_aqua_parquet_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Szennyeződés és régi bevonat eltávolítása; csiszolás, portalanítás. Gyantakiválás: nitrohígító, majd teljes száradás. Színezéshez a Műszaki adatlap FACTOR „2 in 1” Vékonylazúrt említ a lakkozás előtt. Próbafestés javasolt."],
        sourceIds: ["src_factor_aqua_parquet", "src_factor_aqua_parquet_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett; felület max. 25 °C. Alapos felkeverés; festés a fa szálirányában. Speciális lakkozó ecset, henger vagy megfelelő szórás. Alapozó rétegként: 25% vízzel hígított elegy; első réteg: kb. 5% víz. Rétegek között finom csiszolás. Rétegek között legalább 4 óra száradás 25 °C-on — magas páratartalom hosszabbíthat. Festett fa nedvességtartalma max. 12%. Szerszámtisztítás: víz. Fagyveszélyes — használat előtt olvassa el a Műszaki adatlapot és a Biztonsági adatlapot."],
        sourceIds: ["src_factor_aqua_parquet", "src_factor_aqua_parquet_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt|selyemfényű|magasfényű"],
        sourceIds: ["src_factor_aqua_parquet", "src_factor_aqua_parquet_tds"],
      }
    ],
  },
  {
    productId: "prod_factor_aqua_primer",
    sourceIds: ["src_factor_aqua_primer", "src_factor_aqua_primer_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: [
          "A FACTOR Aqua Impregnáló Alapozó felhasználásra kész, vizes bázisú, oldószermentes, színtelen bel- és kültéri faalapozó. Pórustömítő, tapadásjavító impregnálás lazúrozás előtt (faház, asztalos termék, kerti építmény, kerítés, fűrészáru stb.). A beszívódó alapozó után FACTOR Aqua Akril Vastaglazúrral hosszabb esztétikai hatás érhető el a lap szerint.",
          "Kiadósság: 12–14 m²/liter egy rétegben. Rétegszám — két külön gyártói közlés (nem egyesítve): (1) minőségi táblázat, 1. oldal: „Javasolt rétegszám 1 réteg”; (2) Felhasználás, 2. oldal: ecset/henger/mártás „1-2 rétegben”. Fényesség: matt. Kiszerelés: 0,75 l, 2,5 l."
        ],
        sourceIds: ["src_factor_aqua_primer", "src_factor_aqua_primer_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: [
          "Szennyeződés és régi bevonat eltávolítása; csiszolás, portalanítás. Gyanta: nitrohígító, majd teljes száradás. Próbafestés javasolt."
        ],
        sourceIds: ["src_factor_aqua_primer", "src_factor_aqua_primer_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: [
          "Csak +10 °C felett; felület max. 25 °C. Alapos felkeverés; ecset, henger vagy mártás, 1–2 rétegben a Felhasználás szerint. Újabb réteg előtt legalább 4 óra és finom szálirányú csiszolás. Hígítani nem szabad. Festett fa nedvesség max. 12%. Átfesthetőség önmagával 25 °C-on: 4 óra — páratartalom hosszabbíthat. Szerszám: víz. Fagyveszélyes. Használat előtt Műszaki és Biztonsági adatlap."
        ],
        sourceIds: ["src_factor_aqua_primer", "src_factor_aqua_primer_tds"],
      },
      {
        heading: "Fontos korlátok és biztonság",
        paragraphs: [
          "Hígítás tilos. Allergén izotiazolinonok (EUH208). Gyermekektől elzárva; szembe/bőrre ne. VOC A/h max. 30 g/l."
        ],
        sourceIds: ["src_factor_aqua_primer", "src_factor_aqua_primer_tds"],
      }
    ],
  },
  {
    productId: "prod_factor_boat",
    sourceIds: ["src_factor_boat", "src_factor_boat_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: [
          "A FACTOR Csónaklakk oldószeres alkid–poliuretán keverék, UV-szűrőkkel és víztaszító viaszokkal. Kültér: édesvíznek kitett csónak, kemény/nemes fa kerti bútor, terasz, épületrész. Beltér: puha/keményfa fürdőszoba bútor nedvesség ellen. Ne használja élelmiszerrel, takarmánnyal vagy ivóvízzel közvetlenül érintkező felületen.",
          "Kiadósság: 12–14 m²/liter egy rétegben. Beltér 1–2, kültér 2–3 réteg. Fényesség: magasfényű színtelen. Kiszerelés: 0,75 l, 2,5 l."
        ],
        sourceIds: ["src_factor_boat", "src_factor_boat_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: [
          "Szennyeződés/régi bevonat eltávolítása; csiszolás, portalanítás. Gyanta/bitumen: nitrohígító, teljes száradás. Festett fa nedvesség max. 10%. Próbafestés."
        ],
        sourceIds: ["src_factor_boat", "src_factor_boat_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: [
          "Csak +10 °C felett; felület max. 25 °C. Bőrréteg eltávolítása, alapos keverés. Alapozó: FACTOR Csónaklakk 3:1 COROR Szintetikus Hígítóval; 5 óra után 180-as csiszolás, majd lakkozás. Rétegek között 8 óra. Konzisztencia: kb. 5% hígító. Víz terhelés: 3 nap után. Szerszám: COROR Szintetikus Hígító. Tűzveszélyes (UN 1263). Használat előtt Műszaki és Biztonsági adatlap."
        ],
        sourceIds: ["src_factor_boat", "src_factor_boat_tds"],
      },
      {
        heading: "Fontos korlátok és biztonság",
        paragraphs: [
          "Élelmiszer/takarmány/ivóvíz érintkezés tilos. Fa nedvesség max. 10% (nem 12%). Tűzveszélyességi osztály a lap szerint."
        ],
        sourceIds: ["src_factor_boat", "src_factor_boat_tds"],
      }
    ],
  },
  {
    productId: "prod_factor_parquet",
    sourceIds: ["src_factor_parquet", "src_factor_parquet_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: [
          "A FACTOR Parkettalakk felhasználásra kész, oldószeres, beltéri selyem- vagy magasfényű parkettalakk. Elsősorban parketta, továbbá kemény fa, bútor, íróasztal, iskolabútor, tornaszer lakkozására. Egykomponensű, kemény, kopásálló film. Kiadósság: 10–12 m²/liter egy rétegben; 2–3 réteg (nagy terhelésnél 3). Kiszerelés: 0,75 / 2,5 / 5 l (a lapon 20 l is)."
        ],
        sourceIds: ["src_factor_parquet", "src_factor_parquet_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: [
          "Szennyeződés és régi bevonat eltávolítása; csiszolás, portalanítás. Gyanta: nitrohígító, teljes száradás. Előzetes színezés: FACTOR „2 in 1” Vékonylazúr. Próbafestés."
        ],
        sourceIds: ["src_factor_parquet", "src_factor_parquet_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: [
          "Csak +10 °C felett; felület max. 25 °C. Szálirányban; lakkozó ecset, henger vagy szórás. Első réteg: kb. 5% hígítás. Rétegek között legalább 12 óra (25 °C átfesthetőség a táblázatban is 12 óra). Fa nedvesség max. 12%. Hígítás/szerszám: COROR Szintetikus Hígító. Használat előtt Műszaki és Biztonsági adatlap."
        ],
        sourceIds: ["src_factor_parquet", "src_factor_parquet_tds"],
      },
      {
        heading: "Fontos korlátok és biztonság",
        paragraphs: [
          "Tűzveszélyes folyadék és gőz (H226). Gyermekektől elzárva; hő/szikra/nyílt láng tilos; gőz belégzése tilos; védőkesztyű/szemvédő. VOC legfeljebb 500 g/l (A/i) a lap szerint. Intenzív járhatósági nap a TDS „Terhelhetőség” mezőjében nem olvasható ki egyértelműen (UFI szerepel) — nem állítunk ilyet."
        ],
        sourceIds: ["src_factor_parquet", "src_factor_parquet_tds"],
      }
    ],
  },
  {
    productId: "prod_factor_pergola",
    sourceIds: ["src_factor_pergola", "src_factor_pergola_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A FACTOR Pergola kültéri, vízzel hígítható fafesték faszerkezetek időjárás elleni védelmére. Selyemfényű bevonatot ad, a faerezetet nem takarja el teljesen, és a gyártó szerint puha- és keményfán egyaránt használható.", "Tipikus felhasználási kör: pergola, zsalugáter, kerítés, széldeszka, faház, játszótéri elem, méhkaptár és egyéb kültéri faelemek. A Műszaki adatlap szerint fedőfestékként a megfelelően előkészített, régi, megkopott festett felületeken is használható. A juhar árnyalat színfordítóként, FACTOR Aqua Akril Vastaglazúrral kombinálva sötétebb felületek világosabbra festését segíti.", "A bevonat rugalmas, páraáteresztő film; a Műszaki adatlap szerint a fa mozgását követi, és MSZ EN 13300:2001 alapján a legmagasabb dörzsállósági osztályba sorolható. Megfelelő kivitelezés mellett a gyártó akár öt éves tartósságot említ. A faszerkezet acél rögzítőelemeit COROR Rapid Korróziógátló alapozóval kell előkészíteni; beltéri bútor, lakkozott fényes felület, bútorlap vagy fóliázott elem előtt VALMOR Hídképző Alapozó szükséges. Beltérre tervezett termékeket ez a festék önmagában nem teszi kültéri használatra alkalmassá."],
        sourceIds: ["src_factor_pergola", "src_factor_pergola_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Távolítsa el a laza, pergő részeket. Festett felületen csiszoljon, portalanítson, majd zsírtalanítson: a zsíros szennyeződés csiszolással nem távozik, és a vizes bázisú bevonat tapadását gyengíti. Natúr (kezeletlen) fát a Műszaki adatlap szerint csiszolás után portalanítsa.", "Páraáteresztő film miatt világos árnyalatokon a fából oldódó anyagok (például tannin) a felületre kicsapódhatnak. Ennek mérséklésére a gyártó alapozás előtt oldószeres fakonzerváló impregnálást javasol. Egyéb esetben 1:2 arányban vízzel hígított Pergola festékkel alapozzon; mártással a kötőanyag a pórusokba is bejut. Repedéseket az alapozás után több réteg átfestéssel lehet tömíteni."],
        sourceIds: ["src_factor_pergola", "src_factor_pergola_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett dolgozzon; a felület hőmérséklete legfeljebb 25 °C lehet. A festéket alaposan keverje fel, majd ecsettel vagy hengerrel hordja fel. A Műszaki adatlap javasolt rétegszáma 2; a felhordási útmutató szerint 2–3 rétegben is felvihető — a két adatot a gyártó nem különíti el külön esetekre. A rétegek között 25 °C-on 2–4 óra átfesthetőségi időt tartson; a levegő vagy a felület magas páratartalma a száradást több órával meghosszabbíthatja.", "A termék felhasználásra kész. Hígítani nem kötelező; szükség esetén legfeljebb 5% víz adható hozzá. Vékonyan is felvihető, de a tartóssághoz a kiadósságnak megfelelő mennyiségnek fel kell kerülnie (gyártói adat: 4–5 m²/liter két rétegben). Nyílászárók és hasonló használati tárgyak egymásra záródó felületeit egy réteg FACTOR Aqua Parkettalakkkal vonja be. Szerszámok vízzel tisztíthatók."],
        sourceIds: ["src_factor_pergola", "src_factor_pergola_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["selyemfényű"],
        sourceIds: ["src_factor_pergola", "src_factor_pergola_tds"],
      },
    ],
  },
  {
    productId: "prod_valmor_airflow_facade",
    sourceIds: ["src_valmor_airflow_facade", "src_valmor_airflow_facade_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR AIR FLOW Homlokzat és Lábazatfesték egy magas páraáteresztő képességgel rendelkező, környezettudatos, jó fedőképességű, módosított vinil kötőanyagú falfesték. Időjárásálló, szennyeződésnek ellenálló, UV álló. Felhordható normál, lábazati, szárító, páraáteresztő, WTA vakolatokra, betonra, ásványi és lélegző hőszigetelő rendszerekre.", "A VALMOR Air Flow Homlokzat és Lábazatfesték különleges összetételének köszönhetően a fal természetes légzését nem gátolja, magas nedvességtartalmú vakolatra is felvihető. Kimondottan alkalmas csapó eső elleni védelemre, lábazatok festésére. Ideális a frissen készült új falak, valamint régi épületek rendszeres vizesedési problémával küzdő falazatainak bevonására.", "Különösen ajánlott a műemlékvédelem területén, a külső illetve belső felújítási munkálatokhoz. A meglévő homlokzati vakolatok struktúráját megtartva könnyen felhordható. MSZ EN 1062-3:2009 szerint magas víz áteresztésű, MSZ EN ISO 77832:2000 szerint magas vízgőz áteresztő képességű."],
        sourceIds: ["src_valmor_airflow_facade", "src_valmor_airflow_facade_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Frissen vakolt falak esetén, a 28 nap kötési idő letelte után páraáteresztő glettelő anyaggal simítsuk le a felületet. (NE használjon gipsz alapú glettet, helyette válasszon meszes, vagy fehér cement bázisút.) Régebben már felületkezelt falak esetében a laza, pergő részeket távolítsuk el, az olajos, zsíros szennyeződéseket tisztítsuk le!", "Rendszeres vizesedési problémával küzdő falazatoknál, a régi vakolatot távolítsuk el maradéktalanul, majd vakoljuk újra páraáteresztő vakolatrendszerrel. Alapozáshoz minden esetben használja a VALMOR AIR FLOW LÉLEGZŐ MÉLYALAPOZÓ 1:1 arányban vízzel hígított elegyét.", "A festék megtapad az előzetesen már festett diszperziós, meszes, szilikát felületeken. A festési munkálatok megkezdése előtt javasolt a próbafestés elvégzése, különösen a hidrofóbizált, illetve szilikon kötésű felületek esetén."],
        sourceIds: ["src_valmor_airflow_facade", "src_valmor_airflow_facade_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["A festést csak +10 °C felett végezzük! A felhordást végezhetjük ecsettel, hengerrel és szórással. Használat előtt a festéket alaposan keverjük fel. Kőporos, erősen nedvszívó, porózus felületek esetén az első réteg festéket maximum 20% vízzel hígítsuk. Korábban festett felületek esetén 10%-os hígítást ajánlunk.", "Az első réteg felvitele után hagyjuk azt átszáradni, majd a fedőfestést 5 - 10% víz hozzáadásával végezzük! Felhordásnál ügyeljen arra, hogy a kiadósságnál meghatározott mennyiség kerüljön fel a felületre."],
        sourceIds: ["src_valmor_airflow_facade", "src_valmor_airflow_facade_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_valmor_airflow_facade", "src_valmor_airflow_facade_tds"],
      },
    ],
  },
  {
    productId: "prod_valmor_airflow_interior",
    sourceIds: ["src_valmor_airflow_interior", "src_valmor_airflow_interior_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR AIR FLOW Lélegző Beltéri Falfesték felhasználásra kész, diszperziós jellegű, matt, hófehér beltéri falfesték. A műszaki adatlap szerint magas páraáteresztő képességű, száraz dörzsálló, folt nélkül javítható és színezhető.", "Alkalmas normál, lábazati, szárító és páraáteresztő alapvakolatra, valamint betonra; gipszkartonon és korábbi diszperziós festésen is használható. A Műszaki adatlap szerint akár 35% nedvességtartalmú vakolatra is felvihető — ez a vakolat nedvességtartalmára vonatkozik, nem általános falnedvesség-küszöb. A festék nem szünteti meg a nedvesedés okát; rendszeres vizesedésnél a gyártó a megfelelő alapfelület helyreállítását írja elő (lásd Előkészítés). Hőhíd miatt kialakult falpenész kezelésére a Műszaki adatlap a VALMOR AIR FLOW Hőtükör-Festéket jelöli, nem ezt a terméket."],
        sourceIds: ["src_valmor_airflow_interior", "src_valmor_airflow_interior_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Új vakolt falnál várja meg a 28 napos kötési időt, majd páraáteresztő glettel simítson. Gipsz alapú glettet ne használjon; helyette meszes vagy fehér cement bázisú anyagot válasszon. Régi felületről távolítsa el a laza, pergő részeket, és tisztítsa le az olajos, zsíros szennyeződést.", "Rendszeres vizesedésnél a régi vakolatot teljesen el kell távolítani, majd páraáteresztő alapvakolattal újra vakolni — simításhoz a gyártó glett használatát nem engedi. Alapozáshoz minden esetben VALMOR AIR FLOW Lélegző Mélyalapozó 1:1 vízzel hígított elegye szükséges. Munka előtt próbafestés javasolt."],
        sourceIds: ["src_valmor_airflow_interior", "src_valmor_airflow_interior_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett fessen. Ecsettel, hengerrel vagy szórással dolgozhat; a festéket használat előtt alaposan keverje fel. Az első réteghez legfeljebb 10% víz, a fedőréteghez legfeljebb 5% víz adható. Az első réteg után várja meg az átszáradást; 25 °C körül az átfesthetőség kb. 4 óra, magas páratartalom mellett hosszabb lehet.", "A Műszaki adatlap javasolt rétegszáma 2. Fehér, glettelt felületen a gyártói kiadósság 4–5 m²/liter két rétegben; ügyeljen arra, hogy ez a mennyiség felkerüljön. Hígítás és szerszámtisztítás vízzel. A termék fagyveszélyes."],
        sourceIds: ["src_valmor_airflow_interior", "src_valmor_airflow_interior_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_valmor_airflow_interior", "src_valmor_airflow_interior_tds"],
      },
    ],
  },
  {
    productId: "prod_valmor_airflow_primer",
    sourceIds: ["src_valmor_airflow_primer", "src_valmor_airflow_primer_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: [
          "A VALMOR AIR FLOW Lélegző Mélyalapozó 1:1 oldószermentes, bel- és kültéri mélyalapozó. A Műszaki adatlap magas páraáteresztést és környezetbarát jelleget említ — ez gyártói megfogalmazás. Nedvszívó felületekre ajánlja, ahol a felület „lélegzése” szempont; a VALMOR AIR FLOW Lélegző Beltéri Falfesték előtt kifejezetten javasolja.",
          "Fogadófelületek a lapon: ásványi eredetű alapok — szárító-/felújító vakolatrendszer, normál vakolat, gipszkarton, mész-cement simító, meszelt és nedvszívó festett felület. A gyártó szerint a port leköti, a pórusokba behatol, tapadóképes alapot ad, és segíthet a festési foltosodás megelőzésében. Kiadósság hígítva, glettelt felületen: 8–10 m²/liter egy rétegben. Javasolt 1–2 réteg. Fényesség: matt. Kiszerelés: 1 l, 5 l."
        ],
        sourceIds: ["src_valmor_airflow_primer", "src_valmor_airflow_primer_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: [
          "Laza, pergő részek eltávolítása; olajos, zsíros és egyéb szennyeződés tisztítása. Foltos felület: izolálás VALMOR Időjárásálló- és Szigetelőfestékkel. Felülethiba: páraáteresztő glett — a Műszaki adatlap szerint NE gipsz alapú glettet, hanem meszes vagy fehér cement bázisút. Csiszolás utána."
        ],
        sourceIds: ["src_valmor_airflow_primer", "src_valmor_airflow_primer_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: [
          "Csak +10 °C felett. Az alapozó önmagában nem kötelezően hígítandó; a felület szívóképességétől függően legfeljebb azonos mennyiségű vízzel (1:1) hígítható. Felhordás: henger vagy ecset.",
          "A következő fázis a Műszaki adatlap szerint az alapozó teljes száradása előtt is indítható („nedves a nedvesre”) VALMOR AIR FLOW Lélegző Beltéri Falfestékkel. Teljes átszáradás után hagyományos lélegző diszperziós vagy szilikon falfestékkel is átfesthető. Mész-/mészfesték alapnál: a festés legyen 6 hónapnál régebbi. Átfesthetőség önmagával 25 °C-on: min. 2 óra — magas páratartalom hosszabbíthat. Szerszámtisztítás: víz. Fagyveszélyes. Használat előtt olvassa el a Műszaki adatlapot és a Biztonsági adatlapot."
        ],
        sourceIds: ["src_valmor_airflow_primer", "src_valmor_airflow_primer_tds"],
      },
      {
        heading: "Fontos korlátok és biztonság",
        paragraphs: [
          "Gyermekektől elzárva; szembe, bőrre, ruhára ne kerüljön. Nem tűzveszélyes, fagyveszélyes. EU VOC: A/h max. 30 g/l a termékre vonatkozóan a lap szerint."
        ],
        sourceIds: ["src_valmor_airflow_primer", "src_valmor_airflow_primer_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_airflow_salt",
    sourceIds: ["src_valmor_airflow_salt", "src_valmor_airflow_salt_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: [
          "A VALMOR AIR FLOW Sóglett törtfehér porkeverék; vízzel keverve magas konyhasó-tartalmú, beltéri, rusztikus felületképző. Felhordható beltérben mész- vagy cementkötésű ásványi vakolatra. Közvetlen alkalmazás gipszkartonra, gipszes glettre és egyéb (nem ásványi vakolat) felületre kizárt. A Műszaki adatlap ugyanakkor leír előkészítési megoldást: ezek a felületek behálózott EPS ragasztóval tehetők alkalmassá a sóglett felhordására — tehát a kizárás a közvetlen felhordásra vonatkozik, nem zárja ki a gyártói előkészítési utat.",
          "Filmképző diszperziós festék, lakk a bevonására nem alkalmas. Színezés: lúgálló porpigmentekkel legfeljebb 1%. Javasolt rétegvastagság: 3–6 mm. Kiadósság: 1 mm-hez 1,4–1,5 kg/m². Kiszerelés: 8,5 kg. Feldolgozhatóság: 2 óra. Száradás: 1 mm ≈ 1 nap, 6 mm ≈ 6 nap (páratartalom függvényében)."
        ],
        sourceIds: ["src_valmor_airflow_salt", "src_valmor_airflow_salt_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: [
          "Portalanítás; a porozitás függvényében 1–3 dl/m² csapvízzel nedvesítés. A sóglett megtámadja a fémeket — takarással védendők. Filmképző bevonatok (diszperziós, latex, lakk) csiszolással eltávolítandók."
        ],
        sourceIds: ["src_valmor_airflow_salt", "src_valmor_airflow_salt_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: [
          "Csak +10 °C felett. 8,5 kg sóglett ≈ 1,4 liter vízzel, alacsony fordulatú keverővel csomómentes masszává; 5 perc pihentetés, újraátkeverés. Konzisztencia kis vízadaggal módosítható. Min. 3 mm: saválló glettvas és spakli. A bekevert anyagot fel kell használni. Szerszám/vödör: víz. Használat előtt olvassa el a Műszaki adatlapot és a Biztonsági adatlapot."
        ],
        sourceIds: ["src_valmor_airflow_salt", "src_valmor_airflow_salt_tds"],
      },
      {
        heading: "Fontos korlátok és biztonság",
        paragraphs: [
          "Közvetlen felhordás gipszkartonra / gipszes glettre kizárt; a gyártó behálózott EPS ragasztós előkészítést ír le. Nem filmképző festékre/lakkre; fémeket támad. Beltéri alkalmazás a lap szerint."
        ],
        sourceIds: ["src_valmor_airflow_salt", "src_valmor_airflow_salt_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_deep_primer",
    sourceIds: ["src_valmor_deep_primer", "src_valmor_deep_primer_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR Univerzális Mélyalapozó oldószermentes bel- és kültéri impregnáló alapozó, hígítást igényel. A Műszaki adatlap szerint ásványi felületekre alkalmas (többek között tégla, cserép, vakolat, homlokzat, lábazat, gipszkarton, beton), valamint nedvszívó felületek festés vagy műgyanta alapú vakolat előtti alapozására.",
        "A gyártó szerint a port leköti, a pórusokba hatol, erősíti a fogadófelületet és egyenletesebb tapadást segít a rétegek között; a festési foltosodás kockázatát is csökkenti. Három változat: 1:1, koncentrátum 1:4, eszencia 1:8. Kiadósság glettelt felületen: 8–10 m²/liter egy rétegben; javasolt rétegszám: 1. Fényesség: matt."],
        sourceIds: ["src_valmor_deep_primer", "src_valmor_deep_primer_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Laza, pergő részek és olajos/zsíros szennyeződések eltávolítása. Foltos felület izolálására a Műszaki adatlap a VALMOR Időjárásálló- és Szigetelőfestéket említi. Felülethibák: glettelés, majd csiszolás."],
        sourceIds: ["src_valmor_deep_primer", "src_valmor_deep_primer_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett; kültéren esőben vagy tűző napon ne alapozzon. A hígítást a szívóképességhez igazítsa — fényes film a túladagolás jele. 1:1 változat: frissen glettelt felületen 1:1 vízzel; homlokzat, palatető, lábazat, vakolat: hígítás nélkül. Koncentrátum 1:4: frissen glettelt 1:4; homlokzat/pala/lábazat/vakolat 1:3 vízzel; garázs portalanítás, beton, régi kőporos/erősen porózus: 1:2. Eszencia 1:8: frissen glettelt 1:8; homlokzat stb. 1:6; garázs/beton/erősen porózus: 1:4.",
        "A következő munkafázis az alapozó teljes száradása előtt is indítható („nedves a nedvesre”). Átfesthetőség önmagával 25 °C-on: 2 óra — magas páratartalom meghosszabbíthatja. Hígítás és szerszámtisztítás: vízzel. Biztonsági adatlap kötelező."],
        sourceIds: ["src_valmor_deep_primer", "src_valmor_deep_primer_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_valmor_deep_primer", "src_valmor_deep_primer_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_facade",
    sourceIds: ["src_valmor_facade", "src_valmor_facade_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR Homlokzatfesték felhasználásra kész, matt, fehér vizes diszperziós kültéri falfesték. A Műszaki adatlap szerint téglára, természetes kőre, betonra, valamint gipszes és cementes vakolatra alkalmazható. A gyártó a légszennyeződés eróziójával szembeni tartós védelmet és UV-/időjárásállóságot is feltünteti.", "Kültéren túl nagyobb igénybevételű beltéri falakra (például fürdő, konyha, előszoba) is jelöli, tisztítható, nedves dörzsálló filmként. Tartós vizesedésű falazatnál a gyártó a VALMOR AIR FLOW Homlokzat és Lábazatfestéket javasolja helyette. Kiadósság fehér, glettelt felületen: 5 m²/liter két rétegben; javasolt rétegszám: kettő."],
        sourceIds: ["src_valmor_facade", "src_valmor_facade_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["A laza, pergő részeket és a szennyeződéseket el kell távolítani. Izolációs problémákra a Műszaki adatlap a COROR Rapid Korróziógátló Alapozót is említi. Felülethibákat glettelje és csiszolja. Tapadás és egyenletes nedvszívás: VALMOR Univerzális Mélyalapozó. Próbafestés javasolt."],
        sourceIds: ["src_valmor_facade", "src_valmor_facade_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett; esőben vagy tűző nyári napsütésben ne dolgozzon. Ecset, henger vagy szórás. Első réteg: körülbelül 10% víz; fedőréteg: legfeljebb 5% víz. 25 °C körül 1. fokozat max. 2 óra, 5. fokozat max. 24 óra; önmagával körülbelül 4 óra után átfesthető — a páratartalom jelentősen módosíthatja. Szerszámtisztítás vízzel. Biztonsági részletek: hivatalos biztonsági adatlap."],
        sourceIds: ["src_valmor_facade", "src_valmor_facade_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_valmor_facade", "src_valmor_facade_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_floor",
    sourceIds: ["src_valmor_floor", "src_valmor_floor_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR Flexibilis Padlóbevonat felhasználásra kész, vízbázisú, matt bel- és kültéri bevonat. A Műszaki adatlap szerint kopás-, olaj- és vízálló; tipikus lakossági felhasználások: játszótéri rugalmas burkolat, autóbeálló, járda, műhely, veranda, lépcső.", "Dekoratív átfestésre jelöli fa, vakolt vagy beton lábazatot, kerítést, palatetőt és bitumenes hullámlemezt — azbesztes hullámpala nem festhető. Személygépkocsi-terhelésnél a fogadófelület kizárólag jó nedvszívású beton lehet. Finom kvarcliszt miatt a felmosás nehezebb; beltérben a Műszaki adatlap FACTOR Aqua Parkettalakk utókezelést említ a tisztíthatósághoz. Intenzívebb tisztíthatósághoz a gyártó a VALMOR Garázsfestéket javasolja. Kiadósság: kb. 3 m²/liter alapozás + két réteg, glettelt felületen. Javasolt 2–3 réteg; járófelületen javasolt nedves rétegvastagság 330 µm."],
        sourceIds: ["src_valmor_floor", "src_valmor_floor_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Laza, pergő részek és olajos/zsíros szennyeződés eltávolítása; hibák nagyszilárdságú járófelület-javítóval. Az aljzat legyen szilárd, nem porló, nem karcolható, nyomószilárdság legalább C20; megfelelő vízszigetelés és max. 5% nedvesség. Nem nedvszívó / alacsony porozitású felület: VALMOR Hídképző Alapozó. Próbafestés javasolt."],
        sourceIds: ["src_valmor_floor", "src_valmor_floor_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett; felület max. 25 °C; esőben vagy tűző napon ne dolgozzon. Ecset vagy henger; alapos felkeverés. Nedvszívó alapozás: 1:1 vízzel hígított saját termék, intenzív ecsetelés. Első réteg: +10% víz; fedőréteg: +5% víz. 25 °C-on 1. fokozat max. 2 óra, 5. fokozat max. 24 óra; esőállóság / teljes száradás: 24 óra; önmagával átfestés / lépésállóság: 4 óra — magas páratartalom hosszabbíthat.", "Intenzív használat: 3–5 nap után. Szerszámtisztítás: víz. H412 és allergén figyelmeztetés — használat előtt olvassa el a Műszaki adatlapot és a Biztonsági adatlapot."],
        sourceIds: ["src_valmor_floor", "src_valmor_floor_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_valmor_floor", "src_valmor_floor_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_garage",
    sourceIds: ["src_valmor_garage", "src_valmor_garage_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR Garázsfesték felhasználásra kész, oldószeres, selyemfényű uretán-alkid padlóbevonat bel- és kültérre. A Műszaki adatlap szerint a megszilárdult film ellenáll a kopásnak, továbbá olajnak, benzinnek, ammóniának, sós hólének és a háztartási tisztítószereknek; rugalmas, jól terül, takarítható.", "Tipikus területek a gyártó szerint: garázs, autóbeálló, járda, műhely, terasz, pince, veranda, lépcső — átlagos lakossági terhelésre. Személygépkocsi-terhelésnél a Műszaki adatlap max. 2 tonnát említ. A Műszaki adatlap a következő fogadófelületeket sorolja: beton és esztrich, fém, fa, falazat, gipszkarton, aszfalt, kerámia taposó és csempe, kétkomponensű műgyanta, sportpadló, valamint kemény PVC. Gipszes és cementes aljzatkiegyenlítőn a teljes száradás után is próbafestés kell. Kiadósság: 3–4 m²/liter alapozás + két réteg, glettelt felületen; javasolt 2–3 réteg."],
        sourceIds: ["src_valmor_garage", "src_valmor_garage_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Laza, pergő részek, régi bevonat és szennyeződés eltávolítása; hibák nagy szilárdságú járófelület-javítóval. Olaj/zsír kötelezően tisztítandó. Fém: zsírtalanítás után COROR Rapid Korróziógátló Alapozó. Az aljzat legyen szilárd, nem porló, nem karcolható, nyomószilárdság legalább C20; megfelelő vízszigetelés és max. 5% nedvesség. Gipszes kiegyenlítő ≤3 mm: 24 óra után; minden további +1 mm +24 óra. Nem nedvszívó felület: érdesítés után alapozás nélkül. Próbafestés javasolt."],
        sourceIds: ["src_valmor_garage", "src_valmor_garage_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Legalább +5 °C; felület max. 25 °C; esőben vagy tűző napon ne dolgozzon. Ecset, henger vagy megfelelő szórás. Nedvszívó alapozás: +20% COROR Szintetikus Hígító és intenzív ecsetelés. Első réteg konzisztenciáig hígítható; második általában hígítatlan. A Műszaki adatlap szerint 25 °C-on az önmagával való átfestés / lépésállóság 10 óra; a festések között legalább 10 óra száradást ír elő, és a következő réteg előtt ellenőrizni kell az előző réteg megszáradását. Magas páratartalom a száradást több órával is meghosszabbíthatja. Gépjárműves / intenzív használat 3 nap után. Szerszámtisztítás: COROR Szintetikus Hígító. Oldószeres termék — biztonsági adatlap kötelező."],
        sourceIds: ["src_valmor_garage", "src_valmor_garage_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["selyemfényű"],
        sourceIds: ["src_valmor_garage", "src_valmor_garage_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_kontrol",
    sourceIds: ["src_valmor_kontrol", "src_valmor_kontrol_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: [
          "A VALMOR Kontrol felhasználásra kész, diszperziós, matt, hófehér, mosható, nedves dörzsálló (I. osztály) falfesték; antibakteriális adalékkal is rendelhető, levendulaillatú, légáteresztő — a Műszaki adatlap szerint bel- és kültéri. Sokféle fogadófelületet említ: falazóanyag, beton, gipsz, cement, vakolat, glett, diszperziós/latex/mész/zománc átvonás, fűrészporos és üvegszövet tapéta, EPS és kemény műanyag.",
          "Mosható, hígított háztartási tisztítószernek ellenálló; magas páraáteresztést említ. Antibakteriális/bakteriosztatikus adalék opcionális gyártói kínálat — nem FESTÉKINDEX egészségügyi állítás. Kiadósság: 12–13 m²/liter egy rétegben; 1–2 réteg. Kiszerelés: 2 l, 4 l, 10 l."
        ],
        sourceIds: ["src_valmor_kontrol", "src_valmor_kontrol_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: [
          "Laza részek és szennyeződés eltávolítása; hibák glettelése, csiszolás. Porózus felületen VALMOR AIR FLOW lélegző mélyalapozó a lap szerint. Használat előtt Műszaki és Biztonsági adatlap."
        ],
        sourceIds: ["src_valmor_kontrol", "src_valmor_kontrol_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: [
          "Felhordás: ecset, henger, szórás. Felhasználásra kész, hígítás nem szükséges; szerszám: víz. Színezés: pasztell, max. 5% paszta. 25 °C-on 1. fokozat max. 2 óra, 5. fokozat max. 24 óra; átfestés: száraz 2 óra, átfesthető 2–4 óra; moshatóság 1 hét — páratartalom hosszabbíthat. Fagyveszélyes."
        ],
        sourceIds: ["src_valmor_kontrol", "src_valmor_kontrol_tds"],
      },
      {
        heading: "Fontos korlátok és biztonság",
        paragraphs: [
          "Gyermekektől elzárva; szembe/bőrre/ruhára ne. Nem tűzveszélyes, fagyveszélyes. VOC A/a max. 30 g/l a lap szerint. Antibakteriális hatás csak rendelhető adalék esetén, gyártói tájékoztatás szerint."
        ],
        sourceIds: ["src_valmor_kontrol", "src_valmor_kontrol_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_plaster",
    sourceIds: ["src_valmor_plaster", "src_valmor_plaster_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR Vakolat felhasználásra kész, műgyanta bázisú diszperziós vékonyvakolat homlokzatok és belső falak védelmére és díszítésére. Fogadófelület: simított, vakolt, glettelt felület, beton, illetve homlokzati hőszigetelő rendszer zárórétege.", "A Műszaki adatlap algásodás elleni védelmet, víztaszítást, tisztíthatóságot, valamint időjárás-, UV- és dörzsállóságot említ. Szín: fehér. Szemcseméret: 1,5 mm. Kiadósság 1,5 mm kapart struktúránál: 2,4–2,9 kg/m², felhordástól és alaptól függően. Fényesség: matt."],
        sourceIds: ["src_valmor_plaster", "src_valmor_plaster_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Laza, pergő részek és szennyeződés eltávolítása; foltos felület izolálása VALMOR Időjárásálló- és Szigetelőfestékkel. Felülethibák: kültéri glettelés, csiszolás. Tapadás / egyenletes nedvszívás: VALMOR Univerzális Mélyalapozó vagy VALMOR Szemcsés Lábazat- és Betonfesték, a vakolat előtt 24 órával. Próbafelület javasolt."],
        sourceIds: ["src_valmor_plaster", "src_valmor_plaster_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett; felület max. 25 °C. Alapos felkeverés; felhordás rozsdamentes acél simítóval, szemcsevastagságban. Struktúra: 5–10 percen belül műanyag simítóval. Összefüggő felületnél a munka ne szakadjon meg; maszkolószalag a filmképződés előtt távolítandó. Esőben, viharban vagy tűző napon ne dolgozzon.", "25 °C-on 1. fokozat max. 2 óra, 5. fokozat max. 24 óra; önmagával átfestés: 10 óra — magas páratartalom hosszabbíthat. Színezés fehérnél max. 3% paszta. Szerszámtisztítás: víz. Fagyveszélyes — használat előtt olvassa el a Műszaki adatlapot és a Biztonsági adatlapot."],
        sourceIds: ["src_valmor_plaster", "src_valmor_plaster_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_valmor_plaster", "src_valmor_plaster_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_plinth",
    sourceIds: ["src_valmor_plinth", "src_valmor_plinth_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR Lábazatfesték jellemzően kültéri, időjárásálló matt festék lábazatra és alapvakolt felületre. A Műszaki adatlap szerint nagy vagy kis nedvszívású alapokra is hordható — többek között betonra, téglára, diszperziós homlokzat- és lábazatfestékre, EPS/XPS ragasztóra.", "A gyártó a felcsapódó vízzel szembeni ellenállást és színtartóságot emeli ki; teljes átszáradás után tisztítható filmet említ. Hajszálrepedés vagy kisebb glettelési hibák takarására a Műszaki adatlap a VALMOR Szemcsés Lábazat- és Betonfestéket javasolja. Kiadósság: 3,5–4,0 m²/liter két rétegben, glettelt felületen. Javasolt 2–3 réteg. Fényesség: matt."],
        sourceIds: ["src_valmor_plinth", "src_valmor_plinth_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Laza, pergő részek eltávolítása; olajos, zsíros szennyeződés tisztítása. A felület legyen száraz és pormentes; hibák a fogadófelületnek megfelelő javítóanyaggal. A festék a hordozó felől érkező vizesedésnek vagy salétromosodásnak nem áll ellen — ezeket a festés előtt meg kell szüntetni. Próbafestés javasolt."],
        sourceIds: ["src_valmor_plinth", "src_valmor_plinth_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett; felület max. 25 °C; esőben vagy tűző napon ne dolgozzon. Alapos felkeverés. Alapozás: saját termék 1:1 vízzel, intenzív ecseteléssel. Legalább két réteg; nagy igénybevételnél három. Hígítás a felhordáshoz: 5–10% víz. Teljes száradás / önmagával átfestés 25 °C-on: 4 óra — magas páratartalom hosszabbíthat. Szerszámtisztítás: víz. Használat előtt olvassa el a Műszaki adatlapot és a Biztonsági adatlapot."],
        sourceIds: ["src_valmor_plinth", "src_valmor_plinth_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_valmor_plinth", "src_valmor_plinth_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_textured",
    sourceIds: ["src_valmor_textured", "src_valmor_textured_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR Szemcsés Lábazat- és Betonfesték felhasználásra kész, vízbázisú, kvarchomokkal dúsított, jellemzően kültéri, kopás-, olaj- és időjárásálló festék. Fogadófelületek a Műszaki adatlap szerint: beton, műkő, eternit, EPS, XPS és ragasztóik, lábazat, alapvakolat; homlokzatdíszítő elemek kérgesítése és hengerezhető vakolatként is jelöli.", "Előnye a sima festékkel szemben: kisebb glettelési hibák és hajszálrepedések takarása, enyhén strukturált felület. Beton járófelületen a csúszósság csökkentésére is szerepel; ellenáll az átlagos lakossági gyalogos és személygépkocsi terhelésnek. Nem nedvszívó felületen tapadóhídként is használható. Az érdes, matt felület tisztíthatósága korlátozott — intenzív tisztíthatósághoz a gyártó a VALMOR Garázsfestéket vagy a Biztonságos Padló- és Jelölőfestéket javasolja. Kiadósság: lábazaton 3–3,5 m²/liter két rétegben; járófelületen 2,5 m²/liter két rétegben (glettelt). Javasolt 2–3 réteg. Szemcseméret: 0–0,5 mm."],
        sourceIds: ["src_valmor_textured", "src_valmor_textured_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Laza, pergő részek és olajos/zsíros szennyeződés eltávolítása; hibák nagyszilárdságú járófelület-javítóval. Aljzat: szilárd, nem porló, nem karcolható, legalább C20; megfelelő vízszigetelés és max. 5% nedvesség. Nem nedvszívó felület: előzetes érdesítés után alapozás nélkül. Próbafestés javasolt."],
        sourceIds: ["src_valmor_textured", "src_valmor_textured_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett; felület max. 25 °C; esőben vagy tűző napon ne dolgozzon. Ecset vagy struktúrhenger; alapos felkeverés. Nedvszívó alapozás: 1:1 vízzel hígított saját termék intenzív ecseteléssel; alternatíva: VALMOR Univerzális Mélyalapozó megfelelő hígításban. Első réteg: +10% víz; fedőréteg: +5% víz.", "25 °C-on 1. fokozat max. 2 óra, 5. fokozat max. 24 óra; önmagával átfestés: min. 4 óra (lépésálló), tapadóhídként / burkolás előtt 24 óra — magas páratartalom hosszabbíthat. Szerszámtisztítás: víz. Használat előtt olvassa el a Műszaki adatlapot és a Biztonsági adatlapot."],
        sourceIds: ["src_valmor_textured", "src_valmor_textured_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_valmor_textured", "src_valmor_textured_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_weather",
    sourceIds: ["src_valmor_weather", "src_valmor_weather_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR Időjárásálló- és Szigetelőfesték felhasználásra kész, vízzel hígítható, rugalmas bel- és kültéri festék. A Műszaki adatlap három fő szerepkört jelöl: dekoratív fedőfesték, izoláló/szigetelő réteg, valamint tapadóhíd/alapozó funkció. A film UV-álló, vízálló, enyhén sav- és lúgálló, rugalmas; fényesség: selyem-matt.",
        "Tartós védelemként a gyártó időjárásálló, selyemmatt fedőréteget ír le; tipikus területek közé tartoznak a tartósan nyirkos, mohásodó/algásodó falak, lábazatok, fedőkövek, továbbá nem mérettartó fa, könnyű- és színesfémek, műanyag/gumi, csatorna/bádog, valamint füves/műfüves pályavonalak. Izolációként kormos, nikotinos, rozsdás, salétromos, penészes, enyhén zsíros vagy vizes ázási foltokra hordva a Műszaki adatlap szerint gátolja az oldott sók továbbjutását; a megszáradt film a korom/kátrány szagát nem engedi át. Izolációs problémákra a COROR Rapid Korróziógátló Alapozót is említi.",
        "Alapozóként 1:3 vízzel hígítva közbenső tapadórétegként javasolja (például olaj-/zománcfesték, OSB, CK-lap, gipszes felület). Lakkos/zománcos és nem nedvszívó felületeknél a VALMOR Hídképző Alapozót írja elő. Kiadósság: 4 m²/liter két rétegben, glettelt felületen; javasolt 1–2 réteg."],
        sourceIds: ["src_valmor_weather", "src_valmor_weather_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Laza, pergő részek eltávolítása, csiszolásos érdesítés. Alapozás: 1:3 vízzel hígított saját termék, intenzív nyomó-ecsetelés; a következő réteg a száradástól függően 1–2 óra után hordható fel. Felület nedvességtartalma max. 20%. Próbafestés javasolt."],
        sourceIds: ["src_valmor_weather", "src_valmor_weather_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett; felület max. 25 °C. Ecset, henger vagy megfelelő szórás. Festékként felkeverés után hígítás nem kötelező; max. 5% víz megengedett. A rétegek közötti átfesthetőség 25 °C-on 2–4 óra; az első réteg után várjuk meg ezt az intervallumot a második előtt. Magas páratartalom a száradást több órával is meghosszabbíthatja. 25 °C körül 1. fokozat max. 2 óra, 5. fokozat max. 24 óra; végső kötés max. 1 hét (időjárásfüggő). Szerszámtisztítás vízzel. Biztonsági adatlap kötelező."],
        sourceIds: ["src_valmor_weather", "src_valmor_weather_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["selyem-matt"],
        sourceIds: ["src_valmor_weather", "src_valmor_weather_tds"],
      }
    ],
  },
  {
    productId: "prod_valmor_xclusive",
    sourceIds: ["src_valmor_xclusive", "src_valmor_xclusive_tds"],
    sections: [
      {
        heading: "Alkalmazás",
        paragraphs: ["A VALMOR Xclusive Latex Matt felhasználásra kész, matt beltéri latex falfesték. A Műszaki adatlap szerint jó fedőképességű (akár egy rétegben is említi), jól terül, cseppmentesen dolgozható; vízpára- és légáteresztő, tisztítható, mosás- és dörzsálló film. Nedves dörzsállóság: MSZ-EN 13300:2001 szerinti I. osztály.",
        "Fogadófelületek a gyártó szerint: gipszes és cementes vakolat, glettelt felület, gipszkarton, diszperziós/latex átfestés, fűrészporos és üvegszövet tapéta, EPS. Nagy igénybevételű beltéri helyiségekre is jelöli (például óvoda, iskola, étterem, közintézmény). A Műszaki adatlap fehér levendulaillatot és opcionális antibakteriális/bakteriosztatikus adalékot is említ — ezek gyártói állítások. Kiadósság: 12–13 m²/liter egy rétegben, glettelt felületen; javasolt 2 réteg. Körülbelül 25 °C-on a teljes száradás 2–4 óra — magas páratartalom meghosszabbíthatja; a moshatóság egy hét elteltével értendő."],
        sourceIds: ["src_valmor_xclusive", "src_valmor_xclusive_tds"],
      },
      {
        heading: "Előkészítés",
        paragraphs: ["Laza részek és szennyeződések eltávolítása; foltos felület izolálására VALMOR Időjárásálló- és Szigetelőfesték. Hibák: glettelés, csiszolás. Tapadás és egyenletes nedvszívás: VALMOR Univerzális Mélyalapozó. Próbafestés javasolt."],
        sourceIds: ["src_valmor_xclusive", "src_valmor_xclusive_tds"],
      },
      {
        heading: "Felhasználás",
        paragraphs: ["Csak +10 °C felett. Ecset, henger vagy megfelelő szórás. Felkeverés; első réteg max. 10% víz, fedőréteg max. 5% víz. Szerszámtisztítás vízzel. Biztonsági adatlap kötelező."],
        sourceIds: ["src_valmor_xclusive", "src_valmor_xclusive_tds"],
      },
      {
        heading: "Fényesség",
        paragraphs: ["matt"],
        sourceIds: ["src_valmor_xclusive", "src_valmor_xclusive_tds"],
      }
    ],
  },
  ...catalogueClosureProfessionalDescriptionsV1,
];

