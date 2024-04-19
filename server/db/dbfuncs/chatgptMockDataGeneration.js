import fs from "fs";
import { economicCodes } from "../LocalData/EconomicCodes.js";
/* DROPP TAGS, RESTRUKTURER TIL INKUBATORSTATUS ISTEDEN */
/* Chatgpt made this, and it worked! (had to add typing, but it works.) I'll add some parameters to change how many years, and how many companies i want it to generate.
Then i'll add a fs function at the end to update my mockData.json file.*/
// Prefixes and suffixes for dynamic company name generation
const prefixes = [
    // Norwegian cultural and natural elements
    "Nord", "Fjell", "Frost", "Skog", "Hav", "Lys", "Viking", "Draum", "Troll",
    // English imaginative elements
    "Quantum", "Galactic", "Epic", "Mystic", "Vision", "Aurora", "Nova",
    // Combining Norwegian and English for a universal appeal
    "FjordLight", "NordicVision", "VinterDream", "MidnightSun", "PolarStar"
];
const suffixes = [
    // Annet (General)
    "Solutions", "Innovations", "Concepts", "Creations",
    // Energi
    "Energi", "Power", "Renewables", "Solar",
    // FoU/Undervisning
    "Lab", "Research", "Academy", "Studies",
    // Helse
    "Health", "Wellness", "Med", "Care",
    // IKT
    "Tech", "Digital", "Net", "Systems",
    // Industri
    "Factory", "Machines", "Industri", "Production",
    // Kultur
    "Arts", "Culture", "Heritage", "Crafts",
    // Mat og Natur
    "Foods", "Nature", "Harvest", "Greens",
    // Reiseliv
    "Travel", "Voyage", "Expeditions", "Destinations",
    // Tjenesteytring
    "Services", "Solutions", "Professionals", "Experts"
];
const status = [
    "forr_messig_innovasjon",
    "preinkubasjon",
    "inkubatorbedrift",
    "skalering",
    "postinkubasjon",
    "alumni"
];
// Helper function to generate a random company name
const generateCompanyName = () => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const coinFlip = Math.floor(Math.random() * 3);
    if (coinFlip === 1)
        return `${prefix} ${suffix} AS`;
    if (coinFlip === 2)
        return `${prefix} ${suffix} and ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    else
        return `${prefix}${suffix}`;
};
//Chatgpt forgot org nrs should be unique for each company, but only generated once, so had to add this:
const generateOrgNr = () => {
    return `${Math.floor(100000 + Math.random() * 90000000)}`;
};
// Generate yearly data with randomized financial stats and consistent company and tag information
function generateRandomCompanies(numCompanies) {
    const companyTypes = ['AS', 'ASA', 'ENK', 'ANS', 'DA'];
    const naceCategories = [
        "Annet",
        "Energi",
        "FoU/Undervisning",
        "Helse",
        "IKT",
        "Industri",
        "Kultur",
        "Mat og Natur",
        "Reiseliv",
        "Tjenesteytring"
    ];
    ;
    function getRandomDate(startYear, endYear) {
        const randomYear = Math.floor(Math.random() * (endYear - startYear)) + startYear;
        const randomMonth = Math.ceil(Math.random() * 12);
        const randomDay = Math.ceil(Math.random() * 28);
        return { year: randomYear, month: randomMonth, day: randomDay };
    }
    function getRandomCompany() {
        const companyType = companyTypes[Math.floor(Math.random() * companyTypes.length)];
        const endYear = new Date().getFullYear();
        const registrationDate = getRandomDate(2013, endYear);
        const yearsInOperation = Math.ceil(Math.random() * (endYear - registrationDate.year));
        const accounts = [];
        let statusIndex = 0;
        for (let i = 0; i < yearsInOperation; i++) {
            const year = (endYear - yearsInOperation + i).toString();
            const statusChangeCoinflip = Math.floor(Math.random() * 10);
            statusIndex = statusChangeCoinflip > 6 ? statusIndex += 1 : statusIndex;
            const annualAccounts = {
                currency: 'NOK',
                year: year.toString(),
                current_status: status[statusIndex],
                accounts: Object.keys(economicCodes).map(key => {
                    if (Math.floor(Math.random() * 10) > 3) {
                        return {
                            code: key,
                            amount: Math.floor(Math.random() * 10000).toString()
                        };
                    }
                    else
                        return null;
                })
            };
            accounts.push(annualAccounts);
        }
        const naceCategory = naceCategories[Math.floor(Math.random() * naceCategories.length)];
        return {
            companyType: companyType,
            companyTypeName: `${companyType} Company`,
            companyName: generateCompanyName(),
            organisationNumber: generateOrgNr(),
            registrationDate: `${registrationDate.year}.${registrationDate.month}.${registrationDate.day}`,
            yearsInOperation: yearsInOperation,
            annualAccounts: accounts,
            naceCategories: [naceCategory]
        };
    }
    const companies = [];
    for (let i = 0; i < numCompanies; i++) {
        companies.push(getRandomCompany());
    }
    return companies;
}
const mockDataPath = "../mockData/mockData.json";
const generatedCompanies = generateRandomCompanies(200);
fs.writeFileSync(mockDataPath, JSON.stringify(generatedCompanies));
