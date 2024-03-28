import fs from "fs";
/* Chatgpt made this, and it worked! (had to add typing, but it works.) I'll add some parameters to change how many years, and how many companies i want it to generate.
Then i'll add a fs function at the end to update my mockData.json file.*/
function generateDynamicMockEconomicData(companyCount, startYear, endYear) {
    // Prefixes and suffixes for dynamic company name generation
    const prefixes = [
        "Eco",
        "Bio",
        "Tech",
        "Innovate",
        "Global",
        "Hav",
        "Ocean",
        "Health",
        "Future",
        "Fremtid",
        "Bergen",
        "Bjørgvin",
        "Norge",
        "Norway",
        "Nord",
        "North",
        "Cyber",
        "Green",
        "Smart",
        "NextGen",
        "Urban",
        "Solar",
        "Grønn",
        "Sol",
        "Fornybar",
        "Vann",
        "Skog",
        "Fjell",
        "Aegir",
        "Freyr",
        "Idunn",
        "Njord",
        "Galdhøpiggen",
        "Trolltunga",
        "Lofoten",
        "Svalbard",
        "Preikestolen",
        "Panacea",
        "Vitalis",
        "Hygieia",
        "Asclepius",
        "Neptune",
        "Poseidon",
        "Thalassa",
        "Maris",
        "Cypher",
        "Quantum",
        "Aether",
        "Tesla",
        "Agora",
        "Harmonia",
        "Civitas",
        "Utopia"
    ];
    const suffixes = [
        "Solutions",
        "Marine",
        "Health",
        "Tech",
        "Industries",
        "Innovations",
        "Enterprises",
        "Dynamics",
        "Systems",
        "Logistics",
        "Consulting",
        "Analytics",
        "Teknologi",
        "Helse",
        "Energi",
        "Design",
        "Utvikling",
        "Produkter",
        "Networks",
        "Insights",
        "Ventures",
        "Horizons",
        "Pioneers",
        "Frontiers",
        "Innsikt",
        "Eventyr",
        "Oppdagelse",
        "Samfunn",
        "Verdier"
    ];
    const baseTags = ["marin", "helse", "teknologi", "samfunn"];
    const additionalTags = ["bærekraft", "forskning", "innovasjon", "infrastruktur", "miljøvennlig"];
    // Helper function to generate a random company name
    const generateCompanyName = () => {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix}${suffix} AS`;
    };
    // Helper function to generate tags, ensuring at least one base tag and adding one additional tag
    const generateTags = () => {
        const baseTag = baseTags[Math.floor(Math.random() * baseTags.length)];
        const additionalTag = additionalTags[Math.floor(Math.random() * additionalTags.length)];
        return [baseTag, additionalTag];
    };
    //Chatgpt forgot org nrs should be unique for each company, but only generated once, so had to add this:
    const generateOrgNr = () => {
        return `${Math.floor(100000 + Math.random() * 90000000)}`;
    };
    // Generate yearly data with randomized financial stats and consistent company and tag information
    const generateYearlyData = (name, tags, year, orgNr) => ({
        name,
        org_nr: orgNr,
        operating_income: Math.floor(Math.random() * 1000000 + 500000),
        operating_profit: Math.floor(Math.random() * 500000 + 250000),
        result_before_taxes: Math.floor(Math.random() * 400000 + 200000),
        annual_result: Math.floor(Math.random() * 300000 + 150000),
        total_assets: Math.floor(Math.random() * 2000000 + 1000000),
        tags,
        queried_year: year
    });
    // Create mock data for five companies with data for three years each
    // I added some randomness to startYear to make it more organic looking. 
    const data = [];
    for (let i = 0; i < companyCount; i++) {
        const companyName = generateCompanyName();
        const companyTags = generateTags();
        const orgNr = generateOrgNr();
        const companyStartYear = startYear - Math.floor(Math.random() * 11);
        const yearlyData = [];
        for (let year = companyStartYear; year <= endYear; year++) {
            yearlyData.push(generateYearlyData(companyName, companyTags, year, orgNr));
        }
        data.push(yearlyData);
    }
    return data;
}
const generatedMockData = generateDynamicMockEconomicData(200, 2020, 2023);
console.log(generatedMockData);
const path = "../mockData/mockData.json";
fs.writeFileSync(path, JSON.stringify(generatedMockData));
