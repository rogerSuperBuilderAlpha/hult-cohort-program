export type QuestionType = "flashcard" | "mcq";

export type CategoryTag =
  | "culture"
  | "geography"
  | "cuisine"
  | "history"
  | "sports";

export type CategoryFilter =
  | "All"
  | "Culture"
  | "Geography"
  | "Cuisine"
  | "History"
  | "Sports";

export const CATEGORY_FILTERS: CategoryFilter[] = [
  "All",
  "Culture",
  "Geography",
  "Cuisine",
  "History",
  "Sports",
];

const FILTER_TO_TAG: Record<Exclude<CategoryFilter, "All">, CategoryTag> = {
  Culture: "culture",
  Geography: "geography",
  Cuisine: "cuisine",
  History: "history",
  Sports: "sports",
};

type BaseQuestion = {
  id: number;
  question: string;
  answer: string;
  explanation: string;
  category: string;
  tags: CategoryTag[];
};

export type FlashcardQuestion = BaseQuestion & {
  type: "flashcard";
};

export type McqQuestion = BaseQuestion & {
  type: "mcq";
  options: string[];
};

export type Question = FlashcardQuestion | McqQuestion;

export const questionBank: Question[] = [
  {
    id: 1,
    type: "flashcard",
    question:
      "What is the national instrument of Trinidad and Tobago, and when was it developed?",
    answer:
      "The steel pan is the national instrument, invented in Trinidad during the 20th century. It is famously the only new acoustic musical instrument invented in that century.",
    explanation:
      "Steel pans emerged from working-class Carnival traditions in Port of Spain — oil drums tuned into melodic instruments unique to T&T.",
    category: "Culture & Music",
    tags: ["culture"],
  },
  {
    id: 2,
    type: "mcq",
    question:
      "Which famous natural landmark in Trinidad is the largest natural deposit of asphalt in the world?",
    options: [
      "The Nylon Pool",
      "Pitch Lake",
      "The Guanapo Gorge",
      "Argyle Waterfall",
    ],
    answer: "Pitch Lake",
    explanation:
      "Pitch Lake in La Brea is the world’s largest natural asphalt deposit and has supplied paving material for centuries.",
    category: "Geography & Landmarks",
    tags: ["geography"],
  },
  {
    id: 3,
    type: "flashcard",
    question: "What are 'doubles', and what are their main components?",
    answer:
      "Doubles are a famous Trinidadian street food consisting of two soft baras (fried flatbreads) filled with curried channa (chickpeas) and topped with various chutneys and pepper.",
    explanation:
      "Doubles are an Indo-Caribbean breakfast staple — bara + channa, customized with chutney and pepper sauce.",
    category: "Local Cuisine",
    tags: ["cuisine"],
  },
  {
    id: 4,
    type: "mcq",
    question:
      "What is the name of the famous shallow, crystal-clear offshore sandbar swimming pool located off the coast of Tobago?",
    options: [
      "Store Bay",
      "The Nylon Pool",
      "Englishman's Bay",
      "Pigeon Point",
    ],
    answer: "The Nylon Pool",
    explanation:
      "The Nylon Pool is a natural sandbar off Tobago; Princess Margaret supposedly named it for its clear, soft water.",
    category: "Geography & Landmarks",
    tags: ["geography"],
  },
  {
    id: 5,
    type: "flashcard",
    question:
      "What major annual cultural festival in Trinidad and Tobago is widely known as 'The Greatest Show on Earth'?",
    answer:
      "Trinidad and Tobago Carnival, known for its vibrant costumes, steel bands, and soca/calypso music.",
    explanation:
      "T&T Carnival blends African, European, and Indo-Caribbean traditions into mas, calypso, soca, and steelband.",
    category: "Culture & Traditions",
    tags: ["culture"],
  },
  {
    id: 6,
    type: "mcq",
    question:
      "Who became the first Caribbean-born athlete to win an Olympic 100-meter gold medal, doing so for Trinidad and Tobago in 1976?",
    options: [
      "Keshorn Walcott",
      "Ato Boldon",
      "Hasely Crawford",
      "Jereem Richards",
    ],
    answer: "Hasely Crawford",
    explanation:
      "Hasely Crawford won the 100m at the 1976 Montreal Olympics — a landmark for Caribbean sprinting.",
    category: "Sports History",
    tags: ["sports", "history"],
  },
  {
    id: 7,
    type: "flashcard",
    question:
      "What are the two main islands that make up the country, and which is larger?",
    answer:
      "The nation consists of Trinidad (the larger industrial/economic center) and Tobago (the smaller, eco-tourism focused island).",
    explanation:
      "Trinidad holds most of the population and industry; Tobago is smaller and known for reefs and eco-tourism.",
    category: "Geography",
    tags: ["geography"],
  },
  {
    id: 8,
    type: "mcq",
    question:
      "Which aromatic green herb blend forms the foundational base of countless traditional Trinidadian dishes?",
    options: [
      "Green Seasoning (Chadon Beni blend)",
      "Pesto Genovese",
      "Herbes de Provence",
      "Chimichurri",
    ],
    answer: "Green Seasoning (Chadon Beni blend)",
    explanation:
      "Green seasoning — often built around chadon beni (culantro) — is the aromatic base for meats, pelau, and stews.",
    category: "Local Cuisine",
    tags: ["cuisine"],
  },
  {
    id: 9,
    type: "flashcard",
    question: "What is 'Pelau', and how is it traditionally prepared in T&T?",
    answer:
      "Pelau is a one-pot dish made with caramelized chicken, rice, pigeon peas, coconut milk, and various seasonings, slow-cooked together.",
    explanation:
      "Pelau’s signature step is browning meat in burnt sugar before simmering rice, peas, and coconut milk together.",
    category: "Local Cuisine",
    tags: ["cuisine"],
  },
  {
    id: 10,
    type: "mcq",
    question:
      "In what year did Trinidad and Tobago gain its independence from the United Kingdom?",
    options: ["1958", "1962", "1970", "1976"],
    answer: "1962",
    explanation:
      "Trinidad and Tobago became independent on 31 August 1962, with Eric Williams as the first Prime Minister.",
    category: "History",
    tags: ["history"],
  },
  {
    id: 11,
    type: "flashcard",
    question:
      "What is the national bird of Trinidad and Tobago represented on the coat of arms?",
    answer:
      "The Scarlet Ibis (for Trinidad) and the Cocrico (for Tobago).",
    explanation:
      "The coat of arms pairs Trinidad’s Scarlet Ibis with Tobago’s Cocrico — both national birds of the twin-island state.",
    category: "Geography & Wildlife",
    tags: ["geography"],
  },
  {
    id: 12,
    type: "mcq",
    question:
      "Which sport legend from Trinidad and Tobago holds world records in cricket as a record-breaking prolific batsman?",
    options: [
      "Brian Lara",
      "Dwayne Bravo",
      "Kieron Pollard",
      "Sunil Narine",
    ],
    answer: "Brian Lara",
    explanation:
      "Brian Lara set historic Test batting marks, including the highest individual Test innings (400*).",
    category: "Sports History",
    tags: ["sports", "history"],
  },
  {
    id: 13,
    type: "flashcard",
    question:
      "What is 'Chutney Music', and where did its roots originate in T&T?",
    answer:
      "Chutney music is a genre born from the fusion of traditional Bhojpuri Indian music and Caribbean soca/calypso rhythms, heavily popular during Phagwah and celebrations.",
    explanation:
      "Chutney grew from Indo-Trinidadian folk traditions and later fused with soca into chutney-soca dance music.",
    category: "Culture & Music",
    tags: ["culture"],
  },
  {
    id: 14,
    type: "mcq",
    question: "What is the highest peak in Trinidad and Tobago?",
    options: [
      "El Cerro del Aripo",
      "Mount St. Benedict",
      "The Saddle",
      "El Tucuche",
    ],
    answer: "El Cerro del Aripo",
    explanation:
      "El Cerro del Aripo in Trinidad’s Northern Range is the country’s highest peak at about 940 meters.",
    category: "Geography & Landmarks",
    tags: ["geography"],
  },
  {
    id: 15,
    type: "flashcard",
    question: "What is 'Soca' music, and who is credited with creating it?",
    answer:
      "Soul of Calypso (Soca) was pioneered by Garfield Blackman (Lord Shorty) in the early 1970s to fuse calypso with East Indian instrumentation.",
    explanation:
      "Lord Shorty coined soca (“soul of calypso”) to renew calypso with Indo-Caribbean rhythms and instrumentation.",
    category: "Culture & Music",
    tags: ["culture"],
  },
  {
    id: 16,
    type: "mcq",
    question: "What is the capital city of Trinidad and Tobago?",
    options: ["San Fernando", "Port of Spain", "Scarborough", "Chaguanas"],
    answer: "Port of Spain",
    explanation:
      "Port of Spain on Trinidad’s west coast is the capital; Scarborough is Tobago’s main town.",
    category: "Geography",
    tags: ["geography"],
  },
  {
    id: 17,
    type: "flashcard",
    question: "What is 'callaloo', and what is it typically made from?",
    answer:
      "Callaloo is a thick, leafy-green soup or side dish commonly made with dasheen (taro) leaves, okra, coconut milk, and seasonings — often served with crab.",
    explanation:
      "Callaloo is a Caribbean classic; in T&T it’s usually dasheen bush simmered with coconut milk and spice.",
    category: "Local Cuisine",
    tags: ["cuisine"],
  },
  {
    id: 18,
    type: "mcq",
    question:
      "Which Trinidadian calypsonian is often called the 'Grandmaster' and wrote classics like 'Jean and Dinah'?",
    options: [
      "Lord Kitchener",
      "Mighty Sparrow",
      "David Rudder",
      "Shadow",
    ],
    answer: "Mighty Sparrow",
    explanation:
      "Mighty Sparrow (Slinger Francisco) dominated calypso for decades and helped define modern calypso storytelling.",
    category: "Culture & Music",
    tags: ["culture"],
  },
  {
    id: 19,
    type: "flashcard",
    question:
      "What was the name of the short-lived political federation of British Caribbean colonies in the late 1950s, which Trinidad and Tobago joined?",
    answer:
      "The West Indies Federation (1958–1962), a political union of British Caribbean colonies that dissolved before many islands became independent.",
    explanation:
      "The Federation aimed at regional unity but collapsed; T&T then moved to independence in 1962.",
    category: "History",
    tags: ["history"],
  },
  {
    id: 20,
    type: "mcq",
    question: "Which bird sanctuary in Trinidad is famous for scarlet ibis roosting at sunset?",
    options: [
      "Asa Wright Nature Centre",
      "Caroni Bird Sanctuary",
      "Nariva Swamp",
      "Buccoo Reef",
    ],
    answer: "Caroni Bird Sanctuary",
    explanation:
      "Boat tours into the Caroni swamp are known for watching scarlet ibis return to mangrove roosts at dusk.",
    category: "Geography & Wildlife",
    tags: ["geography"],
  },
  {
    id: 21,
    type: "flashcard",
    question: "What is 'bake and shark', and where is it especially associated with?",
    answer:
      "Bake and shark is a popular street-food sandwich of fried shark in fried bake (fried bread), famously associated with Maracas Bay.",
    explanation:
      "Vendors at Maracas Bay load fried bake with shark and a row of local condiments — a T&T beach classic.",
    category: "Local Cuisine",
    tags: ["cuisine"],
  },
  {
    id: 22,
    type: "mcq",
    question:
      "Who was Trinidad and Tobago’s first Prime Minister and a leading figure in the independence movement?",
    options: [
      "A.N.R. Robinson",
      "Eric Williams",
      "George Chambers",
      "Basdeo Panday",
    ],
    answer: "Eric Williams",
    explanation:
      "Dr. Eric Williams, historian and PNM leader, became the first Prime Minister at independence in 1962.",
    category: "History",
    tags: ["history"],
  },
  {
    id: 23,
    type: "flashcard",
    question: "What is 'J'ouvert', and how does it relate to Carnival?",
    answer:
      "J'ouvert (from French 'jour ouvert') is the dark-morning opening of Carnival, when revelers cover themselves in mud, paint, or oil and dance to rhythm sections before the main parade bands.",
    explanation:
      "J'ouvert is Carnival’s raw, pre-dawn street celebration — messy, musical, and communal.",
    category: "Culture & Traditions",
    tags: ["culture"],
  },
  {
    id: 24,
    type: "mcq",
    question:
      "Which Tobago reef area is known for the Nylon Pool and glass-bottom boat tours?",
    options: ["Speyside", "Buccoo Reef", "Castara", "Charlottsville"],
    answer: "Buccoo Reef",
    explanation:
      "Buccoo Reef Marine Park includes coral gardens and the nearby Nylon Pool sandbar.",
    category: "Geography & Landmarks",
    tags: ["geography"],
  },
  {
    id: 25,
    type: "flashcard",
    question: "What is 'pholourie', and how is it usually eaten?",
    answer:
      "Pholourie are seasoned, deep-fried split-pea or flour fritters, typically eaten with a tangy tamarind or mango chutney.",
    explanation:
      "Pholourie is a popular Indo-Trinidadian snack — crispy outside, soft inside, dunked in chutney.",
    category: "Local Cuisine",
    tags: ["cuisine"],
  },
  {
    id: 26,
    type: "mcq",
    question:
      "In what year did Trinidad and Tobago become a republic within the Commonwealth?",
    options: ["1962", "1970", "1976", "1981"],
    answer: "1976",
    explanation:
      "T&T gained independence in 1962 and became a republic in 1976, replacing the British monarch as head of state.",
    category: "History",
    tags: ["history"],
  },
  {
    id: 27,
    type: "flashcard",
    question:
      "What is the difference between calypso and soca in Trinidadian music?",
    answer:
      "Calypso emphasizes storytelling, satire, and social commentary over rhythmic speech-song; soca is a faster, dance-driven offshoot focused on party energy, chorus hooks, and Carnival road march vibes.",
    explanation:
      "Think calypso for lyrical commentary, soca for the fete — related roots, different jobs on the road.",
    category: "Culture & Music",
    tags: ["culture"],
  },
  {
    id: 28,
    type: "mcq",
    question:
      "Which Trinidad-born sprinter won Olympic medals and later became a well-known track analyst?",
    options: [
      "Hasely Crawford",
      "Ato Boldon",
      "Richard Thompson",
      "Keshorn Walcott",
    ],
    answer: "Ato Boldon",
    explanation:
      "Ato Boldon won four Olympic medals in the 1990s and became a prominent athletics commentator.",
    category: "Sports History",
    tags: ["sports"],
  },
  {
    id: 29,
    type: "flashcard",
    question: "What is the 'Twin Island Republic' referring to?",
    answer:
      "It is a common nickname for Trinidad and Tobago, highlighting the two main islands that form one sovereign state.",
    explanation:
      "“Twin Island Republic” underscores that Trinidad and Tobago are one country made of two principal islands.",
    category: "Geography",
    tags: ["geography"],
  },
  {
    id: 30,
    type: "mcq",
    question:
      "Which dish is a traditional Sunday lunch favorite featuring stewed meats, rice, and often macaroni pie?",
    options: [
      "Pelau only",
      "Sunday lunch (Creole lunch)",
      "Roti platter",
      "Oil down",
    ],
    answer: "Sunday lunch (Creole lunch)",
    explanation:
      "Trinidadian Sunday lunch often means stewed chicken or beef, rice, callaloo or provision, salad, and baked macaroni pie.",
    category: "Local Cuisine",
    tags: ["cuisine"],
  },
  {
    id: 31,
    type: "flashcard",
    question: "Who is Keshorn Walcott, and what Olympic history did he make?",
    answer:
      "Keshorn Walcott is a Trinidad and Tobago javelin thrower who won Olympic gold in 2012 — the first Olympic javelin gold for a non-European athlete in decades and a landmark for T&T field events.",
    explanation:
      "Walcott’s London 2012 javelin gold made him a national sports hero beyond the sprint tradition.",
    category: "Sports History",
    tags: ["sports"],
  },
  {
    id: 32,
    type: "mcq",
    question:
      "Which large wetland on Trinidad’s east coast is a UNESCO-listed habitat important for manatees and waterbirds?",
    options: [
      "Caroni Swamp",
      "Nariva Swamp",
      "Bon Accord Lagoon",
      "Oropouche Lagoon",
    ],
    answer: "Nariva Swamp",
    explanation:
      "Nariva Swamp is Trinidad’s largest wetland and a Biosphere Reserve with rich wildlife.",
    category: "Geography & Wildlife",
    tags: ["geography"],
  },
  {
    id: 33,
    type: "flashcard",
    question: "What is 'roti' in Trinidadian cuisine, and name two common fillings?",
    answer:
      "Roti is a soft flatbread wrap filled with curried meats or vegetables; common fillings include chicken, goat, duck, shrimp, or channa and aloo (chickpeas and potato).",
    explanation:
      "Indo-Trinidadian roti shops serve dhalpuri or paratha wraps stuffed with curry — everyday comfort food.",
    category: "Local Cuisine",
    tags: ["cuisine"],
  },
  {
    id: 34,
    type: "mcq",
    question:
      "Which musical form, closely tied to Carnival, features witty social commentary often performed in tents before the festival?",
    options: ["Reggae", "Calypso", "Zouk", "Merengue"],
    answer: "Calypso",
    explanation:
      "Calypso tents are a pre-Carnival tradition where singers compete with topical, satirical songs.",
    category: "Culture & Music",
    tags: ["culture"],
  },
  {
    id: 35,
    type: "flashcard",
    question:
      "What major 1970 protest movement in Trinidad demanded social and racial justice and greater opportunity?",
    answer:
      "The Black Power Revolution (or Black Power Movement) of 1970 involved mass protests, marches, and unrest calling for equality, anti-colonial dignity, and economic justice.",
    explanation:
      "1970 Black Power protests shook T&T politics and culture, pushing questions of race, class, and national identity.",
    category: "History",
    tags: ["history"],
  },
  {
    id: 36,
    type: "mcq",
    question: "What are the two official national colors most associated with the T&T flag?",
    options: [
      "Red, white, and black",
      "Green and gold",
      "Blue and yellow",
      "Orange and purple",
    ],
    answer: "Red, white, and black",
    explanation:
      "The flag’s red field, white edge, and black diagonal band are core national symbols.",
    category: "Culture & Traditions",
    tags: ["culture", "history"],
  },
  {
    id: 37,
    type: "flashcard",
    question: "What is 'liming' in Trinidad and Tobago culture?",
    answer:
      "Liming means hanging out informally with friends — talking, laughing, eating, and relaxing — a central social ritual in T&T life.",
    explanation:
      "To “lime” is to socialize without a rigid agenda; it’s a keyword of Trinidadian everyday culture.",
    category: "Culture & Traditions",
    tags: ["culture"],
  },
  {
    id: 38,
    type: "mcq",
    question:
      "Which Tobago main town serves as the island’s administrative center?",
    options: ["Crown Point", "Roxborough", "Scarborough", "Plymouth"],
    answer: "Scarborough",
    explanation:
      "Scarborough is Tobago’s capital town and ferry/administrative hub.",
    category: "Geography",
    tags: ["geography"],
  },
  {
    id: 39,
    type: "flashcard",
    question: "What is 'chutney soca', and why is it culturally significant?",
    answer:
      "Chutney soca blends Indo-Trinidadian chutney music with soca rhythms, reflecting the creative fusion of African and Indian diasporic cultures in T&T Carnival.",
    explanation:
      "Chutney soca is a sonic emblem of Trinidad’s multicultural mix — especially visible in Carnival and fetes.",
    category: "Culture & Music",
    tags: ["culture"],
  },
  {
    id: 40,
    type: "mcq",
    question:
      "Which sweet Christmas tradition in T&T is a fruit-and-rum soaked cake often shared with guests?",
    options: [
      "Black cake (Caribbean fruit cake)",
      "Panettone",
      "Pound cake only",
      "Baklava",
    ],
    answer: "Black cake (Caribbean fruit cake)",
    explanation:
      "Black cake — dense, dark, and rum-soaked — is a beloved Trinidadian Christmas staple.",
    category: "Local Cuisine",
    tags: ["cuisine", "culture"],
  },
  {
    id: 41,
    type: "flashcard",
    question:
      "What is the Queen's Park Savannah in Port of Spain known for during Carnival?",
    answer:
      "It is a major open park and ceremonial space where large Carnival costume bands cross the stage, and where many city celebrations and gatherings take place.",
    explanation:
      "The Savannah is Port of Spain’s green heart and a primary Carnival parade venue.",
    category: "Culture & Traditions",
    tags: ["culture", "geography"],
  },
  {
    id: 42,
    type: "mcq",
    question:
      "Which cricket venue in Port of Spain is one of the Caribbean’s most famous Test grounds?",
    options: [
      "Kensington Oval",
      "Queen's Park Oval",
      "Sabina Park",
      "Darren Sammy Stadium",
    ],
    answer: "Queen's Park Oval",
    explanation:
      "Queen’s Park Oval is Trinidad’s iconic international cricket ground beside the Savannah.",
    category: "Sports History",
    tags: ["sports", "geography"],
  },
  {
    id: 43,
    type: "flashcard",
    question: "What is 'pastelle', and when is it commonly eaten?",
    answer:
      "Pastelle is a cornmeal pocket filled with seasoned meat (or vegetarian filling), wrapped in a banana leaf and steamed — especially popular at Christmas.",
    explanation:
      "Pastelles are a festive T&T food with Indigenous and broader Latin American roots, adapted locally.",
    category: "Local Cuisine",
    tags: ["cuisine"],
  },
  {
    id: 44,
    type: "mcq",
    question:
      "Which natural feature separates Trinidad from Venezuela by only a short stretch of water?",
    options: [
      "The Mona Passage",
      "The Columbus Channel / Serpent's Mouth area",
      "The Windward Passage",
      "The Yucatán Channel",
    ],
    answer: "The Columbus Channel / Serpent's Mouth area",
    explanation:
      "Trinidad sits just off Venezuela; the Serpent’s Mouth and nearby waters mark that close South American link.",
    category: "Geography",
    tags: ["geography"],
  },
  {
    id: 45,
    type: "flashcard",
    question:
      "What does 'mas' mean in Trinidad Carnival, and what is a 'mas camp'?",
    answer:
      "'Mas' (from masquerade) refers to playing costume in Carnival bands; a mas camp is where bands design, build, and distribute costumes before Carnival Monday and Tuesday.",
    explanation:
      "Playing mas is the costume-and-parade heart of Carnival; mas camps are the creative workshops behind the road.",
    category: "Culture & Traditions",
    tags: ["culture"],
  },
];

export function filterQuestionsByCategory(
  bank: Question[],
  category: CategoryFilter,
): Question[] {
  if (category === "All") return bank;
  const tag = FILTER_TO_TAG[category];
  return bank.filter((q) => q.tags.includes(tag));
}

export function formatAnswerForReview(question: Question): string {
  return question.answer;
}
