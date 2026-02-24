import { UserRole } from '@/app/enums/enums';

export const Roles: {
    value: string;
    label: string;
}[] = [
        {
            value: UserRole.Assistant,
            label: "Membre du comité",
        },
        {
            value: UserRole.HostFamily,
            label: "Famille d'acceuil",
        },
        {
            value: UserRole.Volunteer,
            label: "Bénévole",
        },
    ];

export const YesNo: {
    value: boolean;
    label: string;
}[] = [
        {
            value: false,
            label: "Non",
        },
        {
            value: true,
            label: "Oui",
        },
    ];

export const CatStatus : {
    value: string;
    label: string;
}[] = [
    {
        value: "Non testé",
        label: "Non testé"
    },
    {
        value: "Positif",
        label: "Positif"
    },
    {
        value: "Négatif",
        label: "Négatif"
    }
];

export const CatSexes : {
    value: string;
    label: String;
}[] = [
    {
        value: "Mâle",
        label: "Mâle"
    },
    {
        value: "Femelle",
        label: "Femelle"
    }
]

export const Cities: {
    value: string;
    label: string;
}[] = [
        {
            value: "Algrange",
            label: "Algrange (57440)",
        }, {
            value: "Altkirch",
            label:"Altkirch (68130)"
        },
        {
            value: "Amnéville",
            label:"Amnéville (57360)"
        },
        {
            value: "Audun-le-Tiche",
            label:"Audun-le-Tiche (57390)"
        },
        {
            value: "Aÿ-Champagne",
            label:"Aÿ-Champagne (51150)"
        },
        {
            value: "Bar-le-Duc",
            label:"Bar-le-Duc (55000)"
        },
        {
            value: "Barr",
            label:"Barr (67140)"
        },
        {
            value: "Behren-lès-Forbach",
            label:"Behren-lès-Forbach (57460)"
        },
        {
            value: "Benfeld",
            label:"Benfeld (67230)"
        },
        {
            value: "Bétheny",
            label:"Bétheny (51450)"
        },
        {
            value: "Bischheim",
            label:"Bischheim (67800)"
        },
        {
            value: "Bischwiller",
            label:"Bischwiller (67240)"
        },
        {
            value: "Boulay-Moselle",
            label:"Boulay-Moselle (57220)"
        },
        {
            value: "Brumath",
            label:"Brumath (67170)"
        },
        {
            value: "Brunstatt-Didenheim",
            label:"Brunstatt-Didenheim (68350)"
        },
        {
            value: "Cernay",
            label:"Cernay (68700)"
        },
        {
            value: "Châlons-en-Champagne",
            label:"Châlons-en-Champagne (51000)"
        },
        {
            value: "Champigneulles",
            label:"Champigneulles (54250)"
        },
        {
            value: "Charleville-Mézières",
            label:"Charleville-Mézières (08000)"
        },
        {
            value: "Chaumont",
            label:"Chaumont (52000)"
        },
        {
            value: "Colmar",
            label:"Colmar (68000)"
        },
        {
            value: "Commercy",
            label:"Commercy (55200)"
        },
        {
            value: "Cormontreuil",
            label:"Cormontreuil (51350)"
        },
        {
            value: "Creutzwald",
            label:"Creutzwald (57150)"
        },
        {
            value: "Dombasle-sur-Meurthe",
            label:"Dombasle-sur-Meurthe (54110)"
        },
        {
            value: "Eckbolsheim",
            label:"Eckbolsheim (67201)"
        },
        {
            value: "Ensisheim",
            label:"Ensisheim (68190)"
        },
        {
            value: "Épernay",
            label:"Épernay (51200)"
        },
        {
            value: "Épinal",
            label:"Épinal (88000)"
        },
        {
            value: "Erstein",
            label:"Erstein (67150)"
        },
        {
            value: "Essey-lès-Nancy",
            label:"Essey-lès-Nancy (54270)"
        },
        {
            value: "Fameck",
            label:"Fameck (57290)"
        },
        {
            value: "Farébersviller",
            label:"Farébersviller (57450)"
        },
        {
            value: "Fegersheim",
            label:"Fegersheim (67640)"
        },
        {
            value: "Fismes",
            label:"Fismes (51170)"
        },
        {
            value: "Florange",
            label:"Florange (57190)"
        },
        {
            value: "Forbach",
            label:"Forbach (57600)"
        },
        {
            value: "Freyming-Merlebach",
            label:"Freyming-Merlebach (57800)"
        },
        {
            value: "Frouard",
            label:"Frouard (54390)"
        },
        {
            value: "Geispolsheim",
            label:"Geispolsheim (67118)"
        },
        {
            value: "Gérardmer",
            label:"Gérardmer (88400)"
        },
        {
            value: "Givet",
            label:"Givet (08600)"
        },
        {
            value: "Golbey",
            label:"Golbey (88190)"
        },
        {
            value: "Guebwiller",
            label:"Guebwiller (68500)"
        },
        {
            value: "Guénange",
            label:"Guénange (57310)"
        },
        {
            value: "Hagondange",
            label:"Hagondange (57300)"
        },
        {
            value: "Haguenau",
            label:"Haguenau (67500)"
        },
        {
            value: "Hayange",
            label:"Hayange (57700)"
        },
        {
            value: "Heillecourt",
            label:"Heillecourt (54180)"
        },
        {
            value: "Hettange-Grande",
            label:"Hettange-Grande (57330)"
        },
        {
            value: "Hœnheim",
            label:"Hœnheim (67800)"
        },
        {
            value: "Hombourg-Haut",
            label:"Hombourg-Haut (57470)"
        },
        {
            value: "Homécourt",
            label:"Homécourt (54310)"
        },
        {
            value: "Horbourg-Wihr",
            label:"Horbourg-Wihr (68180)"
        },
        {
            value: "Huningue",
            label:"Huningue (68330)"
        },
        {
            value: "Illkirch-Graffenstaden",
            label:"Illkirch-Graffenstaden (67400)"
        },
        {
            value: "Illzach",
            label:"Illzach (68110)"
        },
        {
            value: "Jarny",
            label:"Jarny (54800)"
        },
        {
            value: "Jarville-la-Malgrange",
            label:"Jarville-la-Malgrange (54140)"
        },
        {
            value: "Jœuf",
            label:"Jœuf (54240)"
        },
        {
            value: "Kingersheim",
            label:"Kingersheim (68260)"
        },
        {
            value: "La Chapelle-Saint-Luc",
            label:"La Chapelle-Saint-Luc (10600)"
        },
        {
            value: "La Wantzenau",
            label:"La Wantzenau (67610)"
        },
        {
            value: "Laneuveville-devant-Nancy",
            label:"Laneuveville-devant-Nancy (54410)"
        },
        {
            value: "Langres",
            label:"Langres (52200)"
        },
        {
            value: "Laxou",
            label:"Laxou (54520)"
        },
        {
            value: "L'Hôpital",
            label:"L'Hôpital (57490)"
        },
        {
            value: "Lingolsheim",
            label:"Lingolsheim (67380)"
        },
        {
            value: "Liverdun",
            label:"Liverdun (54460)"
        },
        {
            value: "Longwy",
            label:"Longwy (54400)"
        },
        {
            value: "Ludres",
            label:"Ludres (54710)"
        },
        {
            value: "Lunéville",
            label:"Lunéville (54300)"
        },
        {
            value: "Lutterbach",
            label:"Lutterbach (68460)"
        },
        {
            value: "Maizières-lès-Metz",
            label:"Maizières-lès-Metz (57280)"
        },
        {
            value: "Malzéville",
            label:"Malzéville (54220)"
        },
        {
            value: "Marange-Silvange",
            label:"Marange-Silvange (57535)"
        },
        {
            value: "Marly",
            label:"Marly (57155)"
        },
        {
            value: "Maxéville",
            label:"Maxéville (54320)"
        },
        {
            value: "Metz",
            label:"Metz (57000)"
        },
        {
            value: "Molsheim",
            label:"Molsheim (67120)"
        },
        {
            value: "Mondelange",
            label:"Mondelange (57300)"
        },
        {
            value: "Montigny-lès-Metz",
            label:"Montigny-lès-Metz (57950)"
        },
        {
            value: "Mont-Saint-Martin",
            label:"Mont-Saint-Martin (54350)"
        },
        {
            value: "Moyeuvre-Grande",
            label:"Moyeuvre-Grande (57250)"
        },
        {
            value: "Mulhouse",
            label:"Mulhouse (68100)"
        },
        {
            value: "Mutzig",
            label:"Mutzig (67190)"
        },
        {
            value: "Nancy",
            label:"Nancy (54000)"
        },
        {
            value: "Neufchâteau",
            label:"Neufchâteau (88300)"
        },
        {
            value: "Neuves-Maisons",
            label:"Neuves-Maisons (54230)"
        },
        {
            value: "Nogent-sur-Seine",
            label:"Nogent-sur-Seine (10400)"
        },
        {
            value: "Nouzonville",
            label:"Nouzonville (08700)"
        },
        {
            value: "Obernai",
            label:"Obernai (67210)"
        },
        {
            value: "Ostwald",
            label:"Ostwald (67540)"
        },
        {
            value: "Petite-Rosselle",
            label:"Petite-Rosselle (57540)"
        },
        {
            value: "Pfastatt",
            label:"Pfastatt (68120)"
        },
        {
            value: "Pont-à-Mousson",
            label:"Pont-à-Mousson (54700)"
        },
        {
            value: "Raon-l'Étape",
            label:"Raon-l'Étape (88110)"
        },
        {
            value: "Reims",
            label:"Reims (51100)"
        },
        {
            value: "Remiremont",
            label:"Remiremont (88200)"
        },
        {
            value: "Rethel",
            label:"Rethel (08300)"
        },
        {
            value: "Revin",
            label:"Revin (08500)"
        },
        {
            value: "Riedisheim",
            label:"Riedisheim (68400)"
        },
        {
            value: "Rixheim",
            label:"Rixheim (68170)"
        },
        {
            value: "Rombas",
            label:"Rombas (57120)"
        },
        {
            value: "Romilly-sur-Seine",
            label:"Romilly-sur-Seine (10100)"
        },
        {
            value: "Saint-André-les-Vergers",
            label:"Saint-André-les-Vergers (10120)"
        },
        {
            value: "Saint-Avold",
            label:"Saint-Avold (57500)"
        },
        {
            value: "Saint-Dié-des-Vosges",
            label:"Saint-Dié-des-Vosges (88100)"
        },
        {
            value: "Saint-Dizier",
            label:"Saint-Dizier (52100)"
        },
        {
            value: "Sainte-Savine",
            label:"Sainte-Savine (10300)"
        },
        {
            value: "Saint-Julien-les-Villas",
            label:"Saint-Julien-les-Villas (10800)"
        },
        {
            value: "Saint-Louis",
            label:"Saint-Louis (68300)"
        },
        {
            value: "Saint-Max",
            label:"Saint-Max (54130)"
        },
        {
            value: "Saint-Memmie",
            label:"Saint-Memmie (51470)"
        },
        {
            value: "Saint-Nicolas-de-Port",
            label:"Saint-Nicolas-de-Port (54210)"
        },
        {
            value: "Sarrebourg",
            label:"Sarrebourg (57400)"
        },
        {
            value: "Sarreguemines",
            label:"Sarreguemines (57200)"
        },
        {
            value: "Sausheim",
            label:"Sausheim (68390)"
        },
        {
            value: "Saverne",
            label:"Saverne (67700)"
        },
        {
            value: "Schiltigheim",
            label:"Schiltigheim (67300)"
        },
        {
            value: "Sedan",
            label:"Sedan (08200)"
        },
        {
            value: "Sélestat",
            label:"Sélestat (67600)"
        },
        {
            value: "Souffelweyersheim",
            label:"Souffelweyersheim (67460)"
        },
        {
            value: "Soultz-Haut-Rhin",
            label:"Soultz-Haut-Rhin (68360)"
        },
        {
            value: "Stiring-Wendel",
            label:"Stiring-Wendel (57350)"
        },
        {
            value: "Strasbourg",
            label:"Strasbourg (67000)"
        },
        {
            value: "Talange",
            label:"Talange (57525)"
        },
        {
            value: "Terville",
            label:"Terville (57180)"
        },
        {
            value: "Thann",
            label:"Thann (68800)"
        },
        {
            value: "Thaon-les-Vosges",
            label:"Thaon-les-Vosges (88150)"
        },
        {
            value: "Thionville",
            label:"Thionville (57100)"
        },
        {
            value: "Tinqueux",
            label:"Tinqueux (51430)"
        },
        {
            value: "Tomblaine",
            label:"Tomblaine (54510)"
        },
        {
            value: "Toul",
            label:"Toul (54200)"
        },
        {
            value: "Troyes",
            label:"Troyes (10000)"
        },
        {
            value: "Uckange",
            label:"Uckange (57270)"
        },
        {
            value: "Val de Briey",
            label:"Val de Briey (54150)"
        },
        {
            value: "Vandœuvre-lès-Nancy",
            label:"Vandœuvre-lès-Nancy (54500)"
        },
        {
            value: "Vendenheim",
            label:"Vendenheim (67550)"
        },
        {
            value: "Verdun",
            label:"Verdun (55100)"
        },
        {
            value: "Villers-lès-Nancy",
            label:"Villers-lès-Nancy (54600)"
        },
        {
            value: "Villerupt",
            label:"Villerupt (54190)"
        },
        {
            value: "Vitry-le-François",
            label:"Vitry-le-François (51300)"
        },
        {
            value: "Wasselonne",
            label:"Wasselonne (67310)"
        },
        {
            value: "Wintzenheim",
            label:"Wintzenheim (68124)"
        },
        {
            value: "Wissembourg",
            label:"Wissembourg (67160)"
        },
        {
            value: "Wittelsheim",
            label:"Wittelsheim (68310)"
        },
        {
            value: "Wittenheim",
            label:"Wittenheim (68270)"
        },
        {
            value: "Woippy",
            label:"Woippy (57140)"
        },
        {
            value: "Yutz",
            label:"Yutz (57970)"
        }
    ];


export const Clinics: {
    value: string;
    label: string;
}[] = [
    {
        value: "AMCB Vétériaires-clinique vétérinaire (Eckbolsheim)",
        label: "AMCB Vétériaires-clinique vétérinaire (Eckbolsheim)"
    },
    {
        value: "Cabinet Vétérinaire Dr VOVAN (Saverne)",
        label: "Cabinet Vétérinaire Dr VOVAN (Saverne)"
    },
    {
        value: "Clinique vétérinaire des 1001 Pattes (Marlenheim)",
        label: "Clinique vétérinaire des 1001 Pattes (Marlenheim)"
    },
    {
        value: "Clinique Vétérinaire des Romains (Strasbourg) *",
        label: "Clinique Vétérinaire des Romains (Strasbourg) *"
    },
    {
        value: "Clinique vétérinaire Rosen'Vet (Rosheim)",
        label: "Clinique vétérinaire Rosen'Vet (Rosheim)"
    },
    {
        value: "L'Arche de Mittel (Mittelhausbergen)",
        label: "L'Arche de Mittel (Mittelhausbergen)"
    },
];

export const voucherObjects: {
    value: string;
    label: string;
}[] = [
    {
        value: "Antiparasitaire",
        label: "Antiparasitaire"
    },
    {
        value: "Autre",
        label: "Autre"
    },
    {
        value: "Écographie",
        label: "Écographie"
    },
    {
        value: "Examens radiographique",
        label: "Examens radiographique"
    },
    {
        value: "Intervention chirurgicale",
        label: "Intervention chirurgicale"
    },
    {
        value: "Primo vaccination",
        label: "Primo vaccination"
    },
    {
        value: "Rappel vaccin",
        label: "Rappel vaccin"
    },
    {
        value: "Stérilisation / Castration",
        label: "Stérilisation / Castration"
    },
    {
        value: "Test FIV & FELV",
        label: "Test FIV & FELV"
    },
    {
        value: "Urgence",
        label: "Urgence"
    },
];

export const newsPeriods: {
    value: string;
    label: string;
}[] = [
    {
        value: "current",
        label: "ce mois-ci"
    },
    {
        value: "next",
        label: "À venir"
    },
];

export interface ColourOption {
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

export const Capacities: readonly ColourOption[] = [
    {
        value: "Empty",
        label: "Empty",
        color: "#00FF00"
    },
    {
        value: "Full",
        label: "Full",
        color: "#FF0000"
    },
];