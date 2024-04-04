import fs from "fs";
/* DROPP TAGS, RESTRUKTURER TIL INKUBATORSTATUS ISTEDEN */
/* Chatgpt made this, and it worked! (had to add typing, but it works.) I'll add some parameters to change how many years, and how many companies i want it to generate.
Then i'll add a fs function at the end to update my mockData.json file.*/
function generateDynamicMockEconomicData(companyCount, startYear = 2013, endYear = new Date().getFullYear()) {
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
        "Forr.messig Innovasjon",
        "preinkubasjon",
        "inkubatorbedrift",
        "Skalering",
        "postinkubasjon",
        "alumni"
    ];
    const fields = [
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
    // Helper function to generate a random company name
    const generateCompanyName = () => {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const coinFlip = Math.floor(Math.random() * 3);
        if (coinFlip === 1)
            return `${prefix}${suffix} AS`;
        if (coinFlip === 2)
            return `${prefix}${suffix} and ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
        else
            return `${prefix}${suffix}`;
    };
    // Helper function to generate tags, ensuring at least one base tag and adding atleast one additional tag
    //This originally only added one tag for each, but i rewrote it to add a random amount of tags, which feels more organic. 
    const generatefield = () => {
        return fields[Math.floor(Math.random() * fields.length)];
    };
    //Chatgpt forgot org nrs should be unique for each company, but only generated once, so had to add this:
    const generateOrgNr = () => {
        return `${Math.floor(100000 + Math.random() * 90000000)}`;
    };
    // Generate yearly data with randomized financial stats and consistent company and tag information
    const generateYearlyData = (name, year, field, orgNr, startIndex) => ({
        name,
        org_nr: orgNr,
        field: field,
        operating_income: Math.floor(Math.random() * 1000000 + 500000),
        operating_profit: Math.floor(Math.random() * 500000 + 250000),
        result_before_taxes: Math.floor(Math.random() * 400000 + 200000),
        annual_result: Math.floor(Math.random() * 300000 + 150000),
        total_assets: Math.floor(Math.random() * 2000000 + 1000000),
        queried_year: year,
        status: status[startIndex]
    });
    // Create mock data for five companies with data for three years each
    // I added some randomness to startYear to make it more organic looking. 
    const data = [];
    for (let i = 0; i < companyCount; i++) {
        const companyName = generateCompanyName();
        const orgNr = generateOrgNr();
        const field = generatefield();
        const companyStartYear = startYear - Math.floor(Math.random() * (endYear - startYear));
        const companyEndYear = companyStartYear + Math.ceil(Math.random() * (endYear - startYear));
        const yearlyData = [];
        let startIndex = 0;
        for (let year = companyStartYear; year <= companyEndYear; year++) {
            const updateStatus = Math.floor(Math.random() * 10);
            if (updateStatus > 7 && startIndex < status.length) {
                startIndex++;
            }
            yearlyData.push(generateYearlyData(companyName, year, field, orgNr, startIndex));
        }
        data.push(yearlyData);
    }
    return data;
}
const generatedMockData = generateDynamicMockEconomicData(1000);
console.log(generatedMockData);
const path = "../mockData/comparisonMockData.json";
fs.writeFileSync(path, JSON.stringify(generatedMockData));
