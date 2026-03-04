export interface WordPowerQuestion {
    word: string;
    options: string[];
    correct: number;
}
export interface WordPowerRoot {
    day: number;
    root: string;
    meaning: string;
    questions: WordPowerQuestion[];
}
export const wordPowerRoots: WordPowerRoot[] = [
    {
        day: 1, root: "EGO", meaning: "Self", questions: [
            { word: "Egoist", options: ["Pursues personal advantage systematically", "Talks incessantly about accomplishments", "Lacks confidence in social settings"], correct: 0 },
            { word: "Egotist", options: ["Constantly boasts about their greatness", "Is obsessed with helping others", "Believes everyone is out to get them"], correct: 0 },
            { word: "Egocentric", options: ["Puts needs of others first", "Considers themselves the universe's focal point", "Hates interacting with people"], correct: 1 }]
    },
    {
        day: 2, root: "ALTER", meaning: "Other", questions: [
            { word: "Altruism", options: ["A desire to change your lifestyle", "Devotion to the welfare of others", "A heated argument over a detail"], correct: 1 },
            { word: "Altercation", options: ["A duplicate version of yourself", "A noisy public verbal dispute", "A surgery to change a trait"], correct: 1 },
            { word: "Alter ego", options: ["A trusted mirror-image friend", "A person you compete against", "A feeling of deep resentment"], correct: 0 }]
    },
    {
        day: 3, root: "VERTO", meaning: "To Turn", questions: [
            { word: "Introvert", options: ["Drives attention to the outside world", "Directs interests toward the inner self", "Uses both hands equally well"], correct: 1 },
            { word: "Extrovert", options: ["Finds energy in social interactions", "Prefers solitude and quiet reflection", "Hates the idea of getting married"], correct: 0 },
            { word: "Ambivert", options: ["Hates both people and animals", "Has a balanced personality of both types", "Always takes the opposite side"], correct: 1 }]
    },
    {
        day: 4, root: "ANTHROPOS", meaning: "Mankind", questions: [
            { word: "Misanthrope", options: ["One who hates the female gender", "One who avoids human society out of dislike", "One who loves to help those in need"], correct: 1 },
            { word: "Anthropology", options: ["The study of the physical world", "The science of human development", "Classification of various insects"], correct: 1 },
            { word: "Philanthropist", options: ["One who makes large charitable donations", "One who collects rare coins", "One who studies stars and planets"], correct: 0 }]
    },
    {
        day: 5, root: "GYNE", meaning: "Woman", questions: [
            { word: "Gynecologist", options: ["Doctor for heart and lung issues", "Specialist in female medical conditions", "One who studies ancient civilizations"], correct: 1 },
            { word: "Misogynist", options: ["One who despises the female sex", "One who hates the institution of marriage", "One who avoids any form of conflict"], correct: 0 },
            { word: "Philogyny", options: ["The study of female history", "A natural fondness for women", "The belief that all people are equal"], correct: 1 }]
    },
    {
        day: 6, root: "GAMOS", meaning: "Marriage", questions: [
            { word: "Monogamy", options: ["Custom of having only one spouse", "The act of living alone", "A hatred of wedding ceremonies"], correct: 0 },
            { word: "Bigamy", options: ["Marriage to two people at once", "A wedding between two cultures", "A long-distance relationship"], correct: 0 },
            { word: "Misogamist", options: ["Someone who hates everyone", "One with deep dislike of marriage", "One who loves secrets"], correct: 1 }]
    },
    {
        day: 7, root: "DERMA", meaning: "Skin", questions: [
            { word: "Dermatologist", options: ["Specialist in skeletal issues", "Specialist in internal organs", "Doctor who treats skin disorders"], correct: 2 },
            { word: "Epidermis", options: ["The outer layer of the skin", "A chronic skin infection", "A scar from a burn"], correct: 0 },
            { word: "Taxidermy", options: ["Collection of government taxes", "Art of preparing animal skins", "Study of deep-sea creatures"], correct: 1 }]
    },
    {
        day: 8, root: "ORTHO", meaning: "Straight/Correct", questions: [
            { word: "Orthodontist", options: ["Doctor who corrects tooth alignment", "Specialist in foot surgery", "Specialist in eye diseases"], correct: 0 },
            { word: "Orthopedic", options: ["Dealing with heart health", "Dealing with bone and joint correction", "Dealing with kidney function"], correct: 1 },
            { word: "Orthodox", options: ["Possessing new and modern ideas", "Following traditional or established beliefs", "Focused on scientific research"], correct: 1 }]
    },
    {
        day: 9, root: "PSYCHE", meaning: "Mind/Soul", questions: [
            { word: "Psychologist", options: ["Expert in human behavior and mental states", "Surgeon who operates on the brain", "Doctor who treats nerve damage"], correct: 0 },
            { word: "Psychopathy", options: ["Severe mental or emotional disturbance", "A physical injury to the head", "A state of perfect mental health"], correct: 0 },
            { word: "Psychosomatic", options: ["Illness caused by the mind's influence", "The ability to read minds", "A fear of people"], correct: 0 }]
    },
    {
        day: 10, root: "LOGOS", meaning: "Word/Study", questions: [
            { word: "Biology", options: ["The study of living organisms", "The study of ancient rocks", "The study of stars"], correct: 0 },
            { word: "Philology", options: ["The study of historical language", "The study of deep-sea life", "The study of philosophy"], correct: 0 },
            { word: "Neologism", options: ["A newly coined word or expression", "An ancient forgotten term", "A scientific classification system"], correct: 0 }]
    },
    {
        day: 11, root: "CARDIO", meaning: "Heart", questions: [
            { word: "Cardiologist", options: ["Doctor specializing in circulatory disorders", "Specialist in respiratory system", "Surgeon focusing on brain trauma"], correct: 0 },
            { word: "Cardiac", options: ["Relating to the core of an engine", "Pertaining to the muscular pump of the body", "A type of rapid aerobic exercise"], correct: 1 },
            { word: "Cardiograph", options: ["Instrument for recording pumping rhythms", "A map for oceanic navigation", "A tool for sketching plans"], correct: 0 }]
    },
    {
        day: 12, root: "NEURON", meaning: "Nerve", questions: [
            { word: "Neurologist", options: ["Specialist in the body's wiring system", "Doctor focusing on skin pigmentation", "Scientist studying fossilized bones"], correct: 0 },
            { word: "Neuralgia", options: ["Acute pain along a sensory path", "A loss of long-term memory", "A state of extreme happiness"], correct: 0 },
            { word: "Neurosis", options: ["An emotional or mental disorder", "A surgical procedure on the spine", "A sharp pain in the jaw"], correct: 0 }]
    },
    {
        day: 13, root: "OPHTHALMOS", meaning: "Eye", questions: [
            { word: "Ophthalmologist", options: ["Doctor trained in vision surgery", "Specialist in hearing and balance", "Expert in mental health diagnosis"], correct: 0 },
            { word: "Oculist", options: ["A traditional term for a vision expert", "A scientist studying deep-sea life", "A performer of optical illusions"], correct: 0 },
            { word: "Monocle", options: ["A stylish piece of headwear", "An eyeglass for a single eye", "A device for viewing microbes"], correct: 1 }]
    },
    {
        day: 14, root: "PAIDOS", meaning: "Child", questions: [
            { word: "Pediatrician", options: ["Doctor for foot injuries", "Specialist in care of infants and youth", "A teacher of ancient philosophy"], correct: 1 },
            { word: "Pedagogy", options: ["The theory and practice of education", "The study of human gait", "A focus on physical fitness"], correct: 0 },
            { word: "Pedant", options: ["A piece of hanging jewelry", "One who makes a show of minor learning", "A child who performs in theater"], correct: 1 }]
    },
    {
        day: 15, root: "ASTRON", meaning: "Star", questions: [
            { word: "Astronomy", options: ["Scientific study of celestial bodies", "Belief in cosmic influence on fate", "Engineering of high-altitude aircraft"], correct: 0 },
            { word: "Astrology", options: ["Scientific mapping of distant galaxies", "Practice of predicting life via planets", "Study of shooting stars only"], correct: 1 },
            { word: "Asterisk", options: ["A star-shaped typographical mark", "A massive explosion of a distant sun", "A vehicle designed for moon landings"], correct: 0 }]
    },
    {
        day: 16, root: "NAUTES", meaning: "Sailor", questions: [
            { word: "Astronaut", options: ["A traveler through the cosmos", "A person who dives in deep oceans", "A world-class marathon runner"], correct: 0 },
            { word: "Cosmonaut", options: ["A space traveler from a specific program", "A sailor on the Mediterranean", "A pilot of supersonic jets"], correct: 0 },
            { word: "Nautical", options: ["Relating to cosmic travel", "Pertaining to ships and navigation", "Relating to the light of the sun"], correct: 1 }]
    },
    {
        day: 17, root: "NOMOS", meaning: "Law/Arrangement", questions: [
            { word: "Autonomy", options: ["Self-governance and independence", "The mechanical laws of vehicles", "The study of name origins"], correct: 0 },
            { word: "Economy", options: ["Management of resources and wealth", "Study of environmental systems", "A type of centralized banking"], correct: 0 },
            { word: "Metronome", options: ["A device for keeping time in music", "A train system for a large city", "A tool for measuring land area"], correct: 0 }]
    },
    {
        day: 18, root: "GEOS", meaning: "Earth", questions: [
            { word: "Geology", options: ["Study of the planet's solid matter", "Art of creating accurate maps", "Science of plant distribution"], correct: 0 },
            { word: "Geometry", options: ["Mathematical study of shapes and space", "Collection of rare gemstones", "Focus on volcanic activity"], correct: 0 },
            { word: "Geography", options: ["Description of the world's features", "Study of deep space objects", "Extraction of gold from mines"], correct: 0 }]
    },
    {
        day: 19, root: "BIOS", meaning: "Life", questions: [
            { word: "Biography", options: ["An account of a person's history", "Scientific study of organisms", "A textbook on human anatomy"], correct: 0 },
            { word: "Autobiography", options: ["A personal narrative by the subject", "History of a motorized vehicle", "A collection of secret thoughts"], correct: 0 },
            { word: "Biopsy", options: ["Examination of tissue from a living body", "Study of botanical life", "A tool for precise surgical cuts"], correct: 0 }]
    },
    {
        day: 20, root: "ENTOMON", meaning: "Insect", questions: [
            { word: "Entomology", options: ["Study of word histories", "Scientific study of insects", "Branch of medicine for hearing"], correct: 1 },
            { word: "Entomophagous", options: ["Feeding specifically on bugs", "Displaying a phobia of insects", "Specializing in pest control"], correct: 0 },
            { word: "Entomoid", options: ["Possessing features like an insect", "A robotic humanoid device", "A type of prehistoric plant"], correct: 0 }]
    },
    {
        day: 21, root: "BIBLION", meaning: "Book", questions: [
            { word: "Bibliophile", options: ["Person who collects or loves books", "A professional writer of fiction", "A librarian in a prestigious school"], correct: 0 },
            { word: "Bibliography", options: ["A list of sources used in a work", "A handwritten historical diary", "The story of a person's life"], correct: 0 },
            { word: "Bibliomania", options: ["A fear of reading complex texts", "Obsessive passion for owning books", "A shop that sells rare manuscripts"], correct: 1 }]
    },
    {
        day: 22, root: "CHRONOS", meaning: "Time", questions: [
            { word: "Chronic", options: ["Occurring for a very short duration", "Persisting over a long period", "Happening only once a year"], correct: 1 },
            { word: "Anachronism", options: ["Something out of its proper time", "A very fast and accurate clock", "A modern technological device"], correct: 0 },
            { word: "Chronological", options: ["Arranged in order of occurrence", "Arranged by size and weight", "Arranged by color and style"], correct: 0 }]
    },
    {
        day: 23, root: "PATHOS", meaning: "Feeling/Suffering", questions: [
            { word: "Pathological", options: ["Being mentally healthy and stable", "Compulsive or caused by a disease", "Having a very happy disposition"], correct: 1 },
            { word: "Empathy", options: ["Understanding another's emotions", "A strong feeling of hatred", "A complete lack of sensitivity"], correct: 0 },
            { word: "Antipathy", options: ["A deep-seated feeling of dislike", "A feeling of intense admiration", "Having no preference at all"], correct: 0 }]
    },
    {
        day: 24, root: "SCIO", meaning: "To Know", questions: [
            { word: "Omniscient", options: ["Possessing universal knowledge", "Knowing absolutely nothing", "Knowing only one specific trade"], correct: 0 },
            { word: "Prescient", options: ["Knowing events before they happen", "Knowing everything about the past", "Knowing secret government codes"], correct: 0 },
            { word: "Conscience", options: ["A sense of right and wrong", "A type of physical sensation", "A state of being unconscious"], correct: 0 }]
    },
    {
        day: 25, root: "OMNIS", meaning: "All", questions: [
            { word: "Omnivorous", options: ["Consuming only plant-based food", "Consuming all types of food", "Consuming only meat products"], correct: 1 },
            { word: "Omnipotent", options: ["Having unlimited power", "Feeling very weak and tired", "Liking every person you meet"], correct: 0 },
            { word: "Omnipresent", options: ["Existing everywhere at once", "Always hiding from view", "Located in one single spot"], correct: 0 }]
    },
    {
        day: 26, root: "GREX", meaning: "Flock/Herd", questions: [
            { word: "Gregarious", options: ["Fond of company and sociable", "Preferring to live in isolation", "Being highly aggressive"], correct: 0 },
            { word: "Egregious", options: ["Remarkably or shockingly bad", "Excellent and praiseworthy", "Very small and insignificant"], correct: 0 },
            { word: "Congregate", options: ["To scatter in different ways", "To gather in a crowd or group", "To travel to a distant land"], correct: 1 }]
    },
    {
        day: 27, root: "PHILO", meaning: "Love", questions: [
            { word: "Philately", options: ["Collection and study of stamps", "Study of stars and planets", "A deep love for ancient books"], correct: 0 },
            { word: "Philanthropy", options: ["Seeking to promote human welfare", "Seeking to gain massive profits", "Study of philosophical ideas"], correct: 0 },
            { word: "Philanderer", options: ["A casual and insincere lover", "A person who hates relationships", "A specialist in marriage law"], correct: 0 }]
    },
    {
        day: 28, root: "SOPHOS", meaning: "Wise", questions: [
            { word: "Sophisticated", options: ["Highly complex or worldly-wise", "Simple and easy to learn", "Rude and lacking in manners"], correct: 0 },
            { word: "Philosophy", options: ["The study of fundamental wisdom", "The study of physical exercise", "The study of animal behavior"], correct: 0 },
            { word: "Sophistry", options: ["A clever but false argument", "A state of perfect knowledge", "The art of teaching children"], correct: 0 }]
    },
    {
        day: 29, root: "DICTO", meaning: "To Say/Speak", questions: [
            { word: "Contradict", options: ["To assert the opposite", "To agree with everything", "To remain completely silent"], correct: 0 },
            { word: "Predict", options: ["To state something beforehand", "To speak after an event occurs", "To lie about what happened"], correct: 0 },
            { word: "Dictate", options: ["To say words for another to record", "To listen to a quiet whisper", "To draw a picture of a scene"], correct: 0 }]
    },
    {
        day: 30, root: "VIVO", meaning: "To Live", questions: [
            { word: "Vivid", options: ["Producing powerful lifelike images", "Dull, gray, and uninteresting", "Very quiet and hard to hear"], correct: 0 },
            { word: "Revive", options: ["To restore to life or vigor", "To end a life permanently", "To put into a deep sleep"], correct: 0 },
            { word: "Convivial", options: ["Friendly, lively, and enjoyable", "Hostile, shy, and antisocial", "Old, tired, and very slow"], correct: 0 }]
    },
    {
        day: 31, root: "PAN", meaning: "All/Every", questions: [
            { word: "Panacea", options: ["A solution for all problems", "An ancient musical instrument", "A small mistake made in haste"], correct: 0 },
            { word: "Pandemonium", options: ["A state of wild noisy disorder", "A peaceful and quiet garden", "A gathering of exotic animals"], correct: 0 },
            { word: "Panorama", options: ["An unbroken view of an entire area", "A small window in a dark room", "A focused study on a single point"], correct: 0 }]
    },
    {
        day: 32, root: "THEOS", meaning: "God", questions: [
            { word: "Theocracy", options: ["System of government by priests", "Rule by the wealthiest citizens", "Government led by the military"], correct: 0 },
            { word: "Atheist", options: ["Person who disbelieves in a deity", "Person who is unsure about God", "A priest of a specific religion"], correct: 0 },
            { word: "Pantheism", options: ["Belief that the universe is God", "Rejection of all religious ideas", "Belief in only one supreme being"], correct: 0 }]
    },
    {
        day: 33, root: "CRACY", meaning: "Rule/Government", questions: [
            { word: "Democracy", options: ["Control by the majority of citizens", "Rule by a single all-powerful king", "System where only the rich vote"], correct: 0 },
            { word: "Aristocracy", options: ["Rule by a privileged upper class", "Government run by elected officials", "Complete lack of laws"], correct: 0 },
            { word: "Plutocracy", options: ["Society governed by the wealthy", "Government led by scientists", "Rule by religious elders"], correct: 0 }]
    },
    {
        day: 34, root: "ARCHY", meaning: "Power/Rule", questions: [
            { word: "Anarchy", options: ["Disorder due to no authority", "A strict organized government", "Rule by two equal leaders"], correct: 0 },
            { word: "Hierarchy", options: ["A system of ranking by authority", "A flat social structure", "A type of historical archway"], correct: 0 },
            { word: "Monarchy", options: ["Government with a single head", "Rule by a group of many people", "System with no clear leader"], correct: 0 }]
    },
    {
        day: 35, root: "PHONOS", meaning: "Sound/Voice", questions: [
            { word: "Cacophony", options: ["Harsh discordant mixture of noises", "A beautiful melodic symphony", "Total and perfect silence"], correct: 0 },
            { word: "Euphony", options: ["Quality of being pleasing to the ear", "A loud jarring mechanical sound", "Sound too quiet to hear"], correct: 0 },
            { word: "Phonetics", options: ["The study of speech sounds", "The art of writing beautifully", "Science of light and optics"], correct: 0 }]
    },
    {
        day: 36, root: "POLY", meaning: "Many", questions: [
            { word: "Polyglot", options: ["Person who speaks many languages", "Person who travels to many lands", "Person who eats many types of meat"], correct: 0 },
            { word: "Polytheism", options: ["Worship of more than one god", "Belief in a single creator", "Rejection of all divine power"], correct: 0 },
            { word: "Polygamy", options: ["Having more than one spouse", "Living in a large family home", "A type of mathematical geometry"], correct: 0 }]
    },
    {
        day: 37, root: "MONO", meaning: "One/Single", questions: [
            { word: "Monopoly", options: ["Exclusive control of a trade", "A market with many small sellers", "A game played with multiple teams"], correct: 0 },
            { word: "Monochrome", options: ["Varying tones of a single color", "Using every color in the rainbow", "Having no visible color at all"], correct: 0 },
            { word: "Monolith", options: ["A single large block of stone", "A small and delicate sculpture", "A modern building of glass"], correct: 0 }]
    },
    {
        day: 38, root: "LOQUOR", meaning: "To Speak", questions: [
            { word: "Loquacious", options: ["Tending to talk a great deal", "Very silent and hard to engage", "Always speaking in an angry tone"], correct: 0 },
            { word: "Soliloquy", options: ["Speaking one's thoughts aloud alone", "Conversation between two people", "A shout directed at a large crowd"], correct: 0 },
            { word: "Colloquial", options: ["Used in ordinary or familiar talk", "Extremely formal and academic", "An ancient and dead language"], correct: 0 }]
    },
    {
        day: 39, root: "BENE", meaning: "Well/Good", questions: [
            { word: "Benefactor", options: ["Person who gives money or help", "Person who causes serious harm", "A fast runner in a marathon"], correct: 0 },
            { word: "Benevolent", options: ["Well-meaning and kindly", "Cruel, spiteful, and hateful", "Very wealthy and greedy"], correct: 0 },
            { word: "Benediction", options: ["The utterance of a blessing", "A formal curse or threat", "A short story with a moral"], correct: 0 }]
    },
    {
        day: 40, root: "MALUS", meaning: "Bad/Evil", questions: [
            { word: "Malevolent", options: ["Wishing to do evil to others", "Wishing for the success of others", "Feeling indifferent to surroundings"], correct: 0 },
            { word: "Malady", options: ["A disease or physical ailment", "A sweet and pleasant melody", "A type of tropical fruit"], correct: 0 },
            { word: "Malignant", options: ["Tending to cause great harm", "Very healthy and full of energy", "Insignificant and very small"], correct: 0 }]
    },
    {
        day: 41, root: "FIDES", meaning: "Faith/Trust", questions: [
            { word: "Fidelity", options: ["Faithfulness to a person or cause", "A type of investment bank", "A deliberate and clever lie"], correct: 0 },
            { word: "Infidel", options: ["Person who does not believe in a religion", "A loyal and dedicated soldier", "A teacher of moral philosophy"], correct: 0 },
            { word: "Confide", options: ["To tell someone a secret in trust", "To shout a message very loudly", "To hide away from all people"], correct: 0 }]
    },
    {
        day: 42, root: "PLAC", meaning: "To Please/Calm", questions: [
            { word: "Placate", options: ["To make someone less angry", "To provoke a violent reaction", "To ignore a person's presence"], correct: 0 },
            { word: "Complacent", options: ["Smugly uncritical of oneself", "Highly anxious about the future", "Unsure of one's own abilities"], correct: 0 },
            { word: "Implacable", options: ["Unable to be calmed or appeased", "Very easy to please and satisfy", "Extremely humorous and witty"], correct: 0 }]
    },
    {
        day: 43, root: "COR", meaning: "Heart", questions: [
            { word: "Cordial", options: ["Warm, friendly, and polite", "Cold, distant, and unfriendly", "Very small and insignificant"], correct: 0 },
            { word: "Discord", options: ["Disagreement between people", "A specific musical harmony", "A state of very deep sleep"], correct: 0 },
            { word: "Concord", options: ["Agreement or harmony between people", "A type of sour purple grape", "A fast jet used for travel"], correct: 0 }]
    },
    {
        day: 44, root: "ANIMUS", meaning: "Mind/Spirit", questions: [
            { word: "Unanimous", options: ["Fully in agreement", "Completely different in opinion", "Being secretive and hidden"], correct: 0 },
            { word: "Animosity", options: ["Strong hostility or hatred", "A great and lasting friendship", "Moving at a very fast pace"], correct: 0 },
            { word: "Magnanimous", options: ["Generous or forgiving", "Petty and small-minded", "Possessing extreme wealth"], correct: 0 }]
    },
    {
        day: 45, root: "SOLUS", meaning: "Alone", questions: [
            { word: "Solitude", options: ["The state of being alone", "The state of being in a crowd", "Being very loud and noisy"], correct: 0 },
            { word: "Solo", options: ["For or by a single person", "Performed by a large team", "Done in complete secrecy"], correct: 0 },
            { word: "Desolate", options: ["Empty, bleak, and lonely", "Full of life and activity", "Extremely bright and sunny"], correct: 0 }]
    },
    {
        day: 46, root: "NOTUS", meaning: "Known", questions: [
            { word: "Notorious", options: ["Admired for great achievements", "Widely known for unfavorable reasons", "Quietly successful in a niche field"], correct: 1 },
            { word: "Notoriety", options: ["State of being famous for something bad", "A legal document proving identity", "The act of taking detailed records"], correct: 0 },
            { word: "Notable", options: ["Worthy of attention or distinction", "Completely forgettable and dull", "Hidden from public knowledge"], correct: 0 }]
    },
    {
        day: 47, root: "SUMMUS", meaning: "Highest", questions: [
            { word: "Consummate", options: ["To fail at the final stage", "To bring to a state of perfection", "To begin a difficult journey"], correct: 1 },
            { word: "Summation", options: ["The final gathering of arguments", "A deduction of the total cost", "The middle point of a story"], correct: 0 },
            { word: "Summit", options: ["The lowest valley of a range", "The highest attainable point", "A meeting held in secret"], correct: 1 }]
    },
    {
        day: 48, root: "GENESIS", meaning: "Birth/Origin", questions: [
            { word: "Congenital", options: ["Developing in later adulthood", "Present from the moment of birth", "Result of poor lifestyle choices"], correct: 1 },
            { word: "Genetics", options: ["Study of inherited traits", "Study of historical artifacts", "Study of skin diseases"], correct: 0 },
            { word: "Genealogy", options: ["Tracing a family's line of descent", "Study of rocks and minerals", "Study of deep space origins"], correct: 0 }]
    },
    {
        day: 49, root: "VETUS", meaning: "Old", questions: [
            { word: "Veteran", options: ["A new and untrained recruit", "A person with long experience", "A specialist in young animals"], correct: 1 },
            { word: "Inveterate", options: ["Habitual and long-established", "Newly discovered or fresh", "A type of modern medicine"], correct: 0 },
            { word: "Venerable", options: ["Respected due to age or wisdom", "Young and full of energy", "Broken down by passing time"], correct: 0 }]
    },
    {
        day: 50, root: "KORRIGERE", meaning: "To Correct", questions: [
            { word: "Incorrigible", options: ["Capable of being easily reformed", "Beyond the possibility of correction", "Always right in every argument"], correct: 1 },
            { word: "Corrigible", options: ["Able to be set right or improved", "Completely broken and useless", "Difficult to locate or find"], correct: 0 },
            { word: "Correction", options: ["A change that makes something right", "An error that remains hidden", "A punishment for a minor crime"], correct: 0 }]
    },
    {
        day: 51, root: "SCRIBO", meaning: "To Write", questions: [
            { word: "Scribe", options: ["One who writes or copies manuscripts", "A type of sharp cutting tool", "A person who reads aloud"], correct: 0 },
            { word: "Inscription", options: ["Words carved or engraved on a surface", "A verbal command given to troops", "A hidden message in a painting"], correct: 0 },
            { word: "Prescription", options: ["A doctor's written instruction for medicine", "A verbal agreement between friends", "A recipe for baking bread"], correct: 0 }]
    },
    {
        day: 52, root: "MANUS", meaning: "Hand", questions: [
            { word: "Manuscript", options: ["A document written by hand", "A machine-printed poster", "A verbal recitation of facts"], correct: 0 },
            { word: "Manipulate", options: ["To handle or control skillfully", "To destroy completely", "To observe from a distance"], correct: 0 },
            { word: "Manicure", options: ["Care and treatment of the hands and nails", "Surgery on the foot", "A haircut and styling session"], correct: 0 }]
    },
    {
        day: 53, root: "SPECIO", meaning: "To Look/See", questions: [
            { word: "Spectacle", options: ["A visually striking performance or display", "A quiet private moment", "A written examination"], correct: 0 },
            { word: "Introspection", options: ["Examination of one's own thoughts", "Looking through a telescope", "Watching a performance on stage"], correct: 0 },
            { word: "Circumspect", options: ["Wary and unwilling to take risks", "Extremely bold and reckless", "Indifferent to consequences"], correct: 0 }]
    },
    {
        day: 54, root: "PORTO", meaning: "To Carry", questions: [
            { word: "Transport", options: ["To carry from one place to another", "To transform into something new", "To translate a foreign text"], correct: 0 },
            { word: "Export", options: ["To send goods to another country", "To import goods from abroad", "To store goods in a warehouse"], correct: 0 },
            { word: "Deportment", options: ["A person's behavior or manners", "A type of shipping container", "A government department"], correct: 0 }]
    },
    {
        day: 55, root: "DUCO", meaning: "To Lead", questions: [
            { word: "Induction", options: ["The act of leading someone in", "A type of electrical resistance", "A form of physical exercise"], correct: 0 },
            { word: "Deduce", options: ["To arrive at a conclusion by reasoning", "To add extra information", "To remove items from a list"], correct: 0 },
            { word: "Conducive", options: ["Making a certain outcome likely", "Blocking progress entirely", "Having no effect whatsoever"], correct: 0 }]
    },
    {
        day: 56, root: "TENDO", meaning: "To Stretch", questions: [
            { word: "Tension", options: ["The state of being stretched tight", "A feeling of complete relaxation", "A type of musical instrument"], correct: 0 },
            { word: "Extend", options: ["To stretch out or make longer", "To shorten or reduce in size", "To keep at the same length"], correct: 0 },
            { word: "Pretentious", options: ["Attempting to impress by affecting importance", "Humble and modest in behavior", "Accurate and factual in speech"], correct: 0 }]
    },
    {
        day: 57, root: "CEDO", meaning: "To Go/Yield", questions: [
            { word: "Precede", options: ["To come before in time or order", "To follow after something", "To happen at the same time"], correct: 0 },
            { word: "Concede", options: ["To admit that something is true", "To deny all accusations firmly", "To ignore a valid argument"], correct: 0 },
            { word: "Recede", options: ["To go or move back", "To advance forward rapidly", "To remain perfectly still"], correct: 0 }]
    },
    {
        day: 58, root: "MITTO", meaning: "To Send", questions: [
            { word: "Transmit", options: ["To send from one place to another", "To receive a signal or message", "To block all communications"], correct: 0 },
            { word: "Remit", options: ["To send money in payment", "To refuse to pay a debt", "To borrow from a stranger"], correct: 0 },
            { word: "Intermittent", options: ["Occurring at irregular intervals", "Happening constantly without pause", "Occurring only once ever"], correct: 0 }]
    },
    {
        day: 59, root: "PONO", meaning: "To Place/Put", questions: [
            { word: "Compose", options: ["To put together or create", "To take apart or destroy", "To ignore or abandon"], correct: 0 },
            { word: "Opponent", options: ["One who is placed against you", "A trusted ally and friend", "A neutral bystander"], correct: 0 },
            { word: "Postpone", options: ["To place at a later time", "To do immediately without delay", "To cancel permanently"], correct: 0 }]
    },
    {
        day: 60, root: "FACIO", meaning: "To Make/Do", questions: [
            { word: "Manufacture", options: ["To make goods on a large scale", "To break down into small pieces", "To sell items at a discount"], correct: 0 },
            { word: "Efficient", options: ["Achieving maximum results with minimum waste", "Wasteful and poorly organized", "Slow and methodical in approach"], correct: 0 },
            { word: "Artifact", options: ["An object made by human workmanship", "A natural rock formation", "A living organism found in soil"], correct: 0 }]
    },
    {
        day: 61, root: "CAPIO", meaning: "To Take/Seize", questions: [
            { word: "Captivate", options: ["To attract and hold the attention of", "To release from imprisonment", "To bore to the point of sleeping"], correct: 0 },
            { word: "Capacious", options: ["Having a lot of space inside", "Extremely small and cramped", "Of average or medium size"], correct: 0 },
            { word: "Receptive", options: ["Willing to consider new ideas", "Closed-minded and stubborn", "Indifferent to all suggestions"], correct: 0 }]
    },
    {
        day: 62, root: "TENEO", meaning: "To Hold", questions: [
            { word: "Tenacious", options: ["Holding firmly; persistent", "Giving up easily", "Indecisive and uncertain"], correct: 0 },
            { word: "Sustain", options: ["To hold up or support", "To let fall or collapse", "To ignore completely"], correct: 0 },
            { word: "Retention", options: ["The act of holding or keeping", "The act of releasing freely", "The act of forgetting quickly"], correct: 0 }]
    },
    {
        day: 63, root: "FRANGO", meaning: "To Break", questions: [
            { word: "Fracture", options: ["A break, especially in a bone", "A smooth and unbroken surface", "A strong and flexible joint"], correct: 0 },
            { word: "Fragile", options: ["Easily broken or damaged", "Extremely strong and durable", "Of moderate toughness"], correct: 0 },
            { word: "Infraction", options: ["A violation or breaking of a rule", "A reward for good behavior", "A period of rest and recovery"], correct: 0 }]
    },
    {
        day: 64, root: "JUNGO", meaning: "To Join", questions: [
            { word: "Junction", options: ["A point where things are joined", "A place where roads diverge", "An empty and isolated area"], correct: 0 },
            { word: "Conjunction", options: ["A word that joins clauses together", "A word that separates ideas", "A word that modifies a verb"], correct: 0 },
            { word: "Disjunction", options: ["A disconnection or separation", "A strong bond or attachment", "A meeting of two rivers"], correct: 0 }]
    },
    {
        day: 65, root: "CLUDO", meaning: "To Close/Shut", questions: [
            { word: "Exclude", options: ["To shut out or keep away", "To welcome with open arms", "To include in every activity"], correct: 0 },
            { word: "Recluse", options: ["A person who lives in seclusion", "A social butterfly at parties", "A public speaker on stage"], correct: 0 },
            { word: "Preclude", options: ["To prevent from happening", "To encourage and support", "To observe without acting"], correct: 0 }]
    },
    {
        day: 66, root: "FLECTO", meaning: "To Bend", questions: [
            { word: "Flexible", options: ["Capable of bending without breaking", "Rigid and completely stiff", "Neither soft nor hard"], correct: 0 },
            { word: "Reflect", options: ["To bend back light or thought", "To absorb all light completely", "To emit a bright glow"], correct: 0 },
            { word: "Inflection", options: ["A change in pitch or tone of voice", "A constant monotone delivery", "Complete silence in speech"], correct: 0 }]
    },
    {
        day: 67, root: "REGO", meaning: "To Rule/Guide", questions: [
            { word: "Regent", options: ["One who rules in place of a monarch", "A common soldier in the army", "A merchant who sells goods"], correct: 0 },
            { word: "Regulate", options: ["To control or direct by rules", "To allow chaos and disorder", "To ignore all guidelines"], correct: 0 },
            { word: "Irregular", options: ["Not following the usual pattern", "Perfectly normal and expected", "Extremely common and routine"], correct: 0 }]
    },
    {
        day: 68, root: "SENTIO", meaning: "To Feel/Perceive", questions: [
            { word: "Sentiment", options: ["A feeling or emotional view", "A logical mathematical proof", "A physical exercise routine"], correct: 0 },
            { word: "Sensitive", options: ["Quick to detect or respond to changes", "Thick-skinned and unfeeling", "Completely numb to sensations"], correct: 0 },
            { word: "Consensus", options: ["General agreement among a group", "A sharp disagreement or debate", "A single person's strong opinion"], correct: 0 }]
    },
    {
        day: 69, root: "CURO", meaning: "To Care/Heal", questions: [
            { word: "Curator", options: ["A keeper or caretaker of a collection", "A person who destroys art", "A builder of new structures"], correct: 0 },
            { word: "Secure", options: ["Free from worry or danger", "Anxious and full of dread", "Careless and irresponsible"], correct: 0 },
            { word: "Procure", options: ["To obtain or acquire with care", "To lose or misplace something", "To give away freely"], correct: 0 }]
    },
    {
        day: 70, root: "STRUGO", meaning: "To Build", questions: [
            { word: "Construct", options: ["To build or put together", "To tear down or demolish", "To paint a detailed picture"], correct: 0 },
            { word: "Infrastructure", options: ["The basic physical systems of a society", "A type of architectural decoration", "An advanced computer program"], correct: 0 },
            { word: "Obstruct", options: ["To block or get in the way of", "To clear a path for others", "To build a bridge over water"], correct: 0 }]
    },
    {
        day: 71, root: "ERRO", meaning: "To Wander/Stray", questions: [
            { word: "Erratic", options: ["Unpredictable and inconsistent", "Steady and perfectly reliable", "Boring and monotonous"], correct: 0 },
            { word: "Aberrant", options: ["Departing from the accepted norm", "Following all established rules", "Being perfectly average"], correct: 0 },
            { word: "Erroneous", options: ["Wrong or incorrect", "Absolutely accurate and true", "Partially correct but vague"], correct: 0 }]
    },
    {
        day: 72, root: "VOCO", meaning: "To Call", questions: [
            { word: "Vocation", options: ["A calling or strong inclination to a career", "A short vacation from work", "A type of singing performance"], correct: 0 },
            { word: "Advocate", options: ["To publicly support or recommend", "To secretly oppose a cause", "To remain neutral on all issues"], correct: 0 },
            { word: "Revoke", options: ["To officially cancel or take back", "To renew or extend an agreement", "To strengthen a commitment"], correct: 0 }]
    },
    {
        day: 73, root: "PENDO", meaning: "To Hang/Weigh", questions: [
            { word: "Suspend", options: ["To hang or temporarily stop", "To accelerate or speed up", "To permanently establish"], correct: 0 },
            { word: "Depend", options: ["To hang from or rely upon", "To stand alone without help", "To compete aggressively"], correct: 0 },
            { word: "Pendant", options: ["A piece of jewelry that hangs", "A type of comfortable shoe", "A kind of writing instrument"], correct: 0 }]
    },
    {
        day: 74, root: "TRAHO", meaning: "To Draw/Pull", questions: [
            { word: "Attract", options: ["To draw toward oneself", "To push away forcefully", "To keep at a fixed distance"], correct: 0 },
            { word: "Retract", options: ["To draw back or withdraw", "To extend further outward", "To freeze in one position"], correct: 0 },
            { word: "Distract", options: ["To draw attention away from", "To focus intently on a task", "To complete something quickly"], correct: 0 }]
    },
    {
        day: 75, root: "CURRO", meaning: "To Run", questions: [
            { word: "Current", options: ["Running or flowing; present time", "Stagnant and not moving", "Belonging to the distant past"], correct: 0 },
            { word: "Concurrent", options: ["Running together; simultaneous", "Happening at different times", "Occurring once every decade"], correct: 0 },
            { word: "Incur", options: ["To run into; bring upon oneself", "To avoid a negative outcome", "To outrun all competitors"], correct: 0 }]
    },
    {
        day: 76, root: "MORIOR", meaning: "To Die", questions: [
            { word: "Mortal", options: ["Subject to death", "Living forever without aging", "Neither alive nor dead"], correct: 0 },
            { word: "Moribund", options: ["At the point of death; stagnant", "Full of life and vitality", "Growing rapidly and expanding"], correct: 0 },
            { word: "Immortal", options: ["Living forever; never dying", "Dying at a young age", "Having a limited lifespan"], correct: 0 }]
    },
    {
        day: 77, root: "NASCOR", meaning: "To Be Born", questions: [
            { word: "Nascent", options: ["Just beginning to develop", "Fully mature and complete", "Rapidly declining in quality"], correct: 0 },
            { word: "Renaissance", options: ["A rebirth or revival of interest", "A period of total destruction", "The end of an historical era"], correct: 0 },
            { word: "Innate", options: ["Present from birth; natural", "Learned through formal education", "Acquired through hard work"], correct: 0 }]
    },
    {
        day: 78, root: "ANNUS", meaning: "Year", questions: [
            { word: "Annual", options: ["Occurring once every year", "Happening every single day", "Occurring once every decade"], correct: 0 },
            { word: "Anniversary", options: ["The yearly return of a date", "A monthly celebration event", "A one-time special occasion"], correct: 0 },
            { word: "Perennial", options: ["Lasting for an indefinitely long time", "Lasting for only one season", "Occurring every other year"], correct: 0 }]
    },
    {
        day: 79, root: "TERMINUS", meaning: "End/Boundary", questions: [
            { word: "Terminal", options: ["Forming the end or boundary", "Located at the very beginning", "Positioned exactly in the middle"], correct: 0 },
            { word: "Determine", options: ["To establish the limits or end of", "To leave entirely open-ended", "To begin without any plan"], correct: 0 },
            { word: "Exterminate", options: ["To destroy completely; end totally", "To give birth to new life", "To nurture and care for"], correct: 0 }]
    },
    {
        day: 80, root: "POTENS", meaning: "Powerful", questions: [
            { word: "Potent", options: ["Having great power or effect", "Very weak and ineffective", "Completely harmless and mild"], correct: 0 },
            { word: "Impotent", options: ["Lacking power or ability", "Extremely strong and forceful", "Moderately capable and skilled"], correct: 0 },
            { word: "Omnipotent", options: ["Having unlimited or total power", "Having no power whatsoever", "Having power over one domain only"], correct: 0 }]
    },
    {
        day: 81, root: "CREDO", meaning: "To Believe", questions: [
            { word: "Credible", options: ["Able to be believed; convincing", "Obviously false and unreliable", "Neither true nor false"], correct: 0 },
            { word: "Incredulous", options: ["Unwilling or unable to believe", "Extremely gullible and naive", "Believing everything without question"], correct: 0 },
            { word: "Creed", options: ["A system of beliefs or principles", "A type of musical composition", "A legal document or contract"], correct: 0 }]
    },
    {
        day: 82, root: "VERT", meaning: "To Turn", questions: [
            { word: "Avert", options: ["To turn away or prevent", "To face directly head-on", "To ignore without caring"], correct: 0 },
            { word: "Divert", options: ["To turn aside from a course", "To continue straight ahead", "To stop moving entirely"], correct: 0 },
            { word: "Subvert", options: ["To undermine the power of", "To strongly support and uphold", "To observe without interfering"], correct: 0 }]
    },
    {
        day: 83, root: "PRIMUS", meaning: "First", questions: [
            { word: "Primary", options: ["Of chief importance; first", "Of secondary significance", "Of no importance whatsoever"], correct: 0 },
            { word: "Primitive", options: ["Relating to an early stage", "Extremely modern and advanced", "Moderately developed"], correct: 0 },
            { word: "Primordial", options: ["Existing from the very beginning", "Created only very recently", "Appearing in the middle of time"], correct: 0 }]
    },
    {
        day: 84, root: "COGNOSCO", meaning: "To Know/Recognize", questions: [
            { word: "Cognition", options: ["The mental process of knowing", "A physical reflex action", "A type of emotional outburst"], correct: 0 },
            { word: "Recognize", options: ["To know again or identify", "To forget completely", "To confuse with something else"], correct: 0 },
            { word: "Incognito", options: ["With one's identity concealed", "With one's identity on display", "Without any disguise at all"], correct: 0 }]
    },
    {
        day: 85, root: "AEQUUS", meaning: "Equal/Fair", questions: [
            { word: "Equanimity", options: ["Calmness and composure of mind", "Extreme anger and frustration", "A state of deep confusion"], correct: 0 },
            { word: "Equitable", options: ["Fair and impartial", "Biased and one-sided", "Unpredictable and random"], correct: 0 },
            { word: "Equivalent", options: ["Equal in value or function", "Completely different in nature", "Slightly inferior in quality"], correct: 0 }]
    },
    {
        day: 86, root: "LIBER", meaning: "Free", questions: [
            { word: "Liberate", options: ["To set free from captivity", "To imprison permanently", "To keep under strict control"], correct: 0 },
            { word: "Liberal", options: ["Open to new ideas; generous", "Extremely conservative and rigid", "Neutral on all matters"], correct: 0 },
            { word: "Liberty", options: ["The state of being free", "The state of being enslaved", "The state of being confused"], correct: 0 }]
    },
    {
        day: 87, root: "FORTIS", meaning: "Strong", questions: [
            { word: "Fortify", options: ["To make strong or strengthen", "To weaken or tear down", "To leave unchanged"], correct: 0 },
            { word: "Fortitude", options: ["Courage in facing difficulty", "Cowardice in the face of danger", "Indifference to all challenges"], correct: 0 },
            { word: "Forte", options: ["A person's strong point or talent", "A person's greatest weakness", "An area of complete ignorance"], correct: 0 }]
    },
    {
        day: 88, root: "BREVIS", meaning: "Short", questions: [
            { word: "Brevity", options: ["Concise and exact use of words", "An extremely long explanation", "A moderate length of text"], correct: 0 },
            { word: "Abbreviate", options: ["To shorten a word or phrase", "To extend or make longer", "To keep at the original length"], correct: 0 },
            { word: "Brief", options: ["Of short duration; concise", "Extremely long and detailed", "Of medium or average length"], correct: 0 }]
    },
    {
        day: 89, root: "MAGNUS", meaning: "Great/Large", questions: [
            { word: "Magnify", options: ["To make something appear larger", "To make something appear smaller", "To keep at the same size"], correct: 0 },
            { word: "Magnificent", options: ["Extremely beautiful or impressive", "Plain and unremarkable", "Slightly above average quality"], correct: 0 },
            { word: "Magnitude", options: ["The great size or extent of something", "A very small and tiny amount", "A moderate or average quantity"], correct: 0 }]
    },
    {
        day: 90, root: "NIHIL", meaning: "Nothing", questions: [
            { word: "Nihilism", options: ["The rejection of all values and beliefs", "A strong devotion to tradition", "A balanced and moderate viewpoint"], correct: 0 },
            { word: "Annihilate", options: ["To destroy completely; reduce to nothing", "To build up from scratch", "To repair and restore fully"], correct: 0 },
            { word: "Nil", options: ["Nothing; zero", "A large amount", "An unknown quantity"], correct: 0 }]
    },
    {
        day: 91, root: "TACEO", meaning: "To Be Silent", questions: [
            { word: "Tacit", options: ["Understood without being stated", "Spoken loudly and clearly", "Written in formal legal terms"], correct: 0 },
            { word: "Taciturn", options: ["Reserved or saying little", "Extremely talkative and chatty", "Moderately conversational"], correct: 0 },
            { word: "Reticent", options: ["Not revealing one's thoughts readily", "Open and forthcoming with opinions", "Aggressively sharing every detail"], correct: 0 }]
    },
    {
        day: 92, root: "AUDAX", meaning: "Bold/Daring", questions: [
            { word: "Audacious", options: ["Showing willingness to take bold risks", "Extremely cautious and timid", "Moderately brave on occasion"], correct: 0 },
            { word: "Audacity", options: ["Rude or disrespectful boldness", "Extreme shyness and reserve", "Quiet and thoughtful reflection"], correct: 0 },
            { word: "Intrepid", options: ["Fearless and adventurous", "Fearful and cowardly", "Cautious but willing"], correct: 0 }]
    },
    {
        day: 93, root: "CLEMENS", meaning: "Merciful/Mild", questions: [
            { word: "Clemency", options: ["Mercy or leniency in punishment", "Extreme harshness in sentencing", "Complete indifference to justice"], correct: 0 },
            { word: "Clement", options: ["Mild and merciful in temperament", "Harsh and unforgiving always", "Cold and calculating personality"], correct: 0 },
            { word: "Inclement", options: ["Severe or stormy weather", "Pleasant and sunny conditions", "Mild and comfortable climate"], correct: 0 }]
    },
    {
        day: 94, root: "ACER", meaning: "Sharp/Keen", questions: [
            { word: "Acerbic", options: ["Sharp and forthright in manner", "Gentle and soft-spoken always", "Neutral and without opinion"], correct: 0 },
            { word: "Acumen", options: ["The ability to judge well; keenness", "A complete lack of judgment", "Average intelligence at best"], correct: 0 },
            { word: "Exacerbate", options: ["To make a problem sharper or worse", "To solve a problem completely", "To leave a situation unchanged"], correct: 0 }]
    },
    {
        day: 95, root: "NOMEN", meaning: "Name", questions: [
            { word: "Nomenclature", options: ["A system of names or terms", "A type of mathematical formula", "A method of cooking food"], correct: 0 },
            { word: "Nominal", options: ["In name only; very small", "In reality and substance", "Extremely large and significant"], correct: 0 },
            { word: "Misnomer", options: ["A wrong or inaccurate name", "A perfectly chosen title", "A name used only by royalty"], correct: 0 }]
    },
    {
        day: 96, root: "LINGUA", meaning: "Language/Tongue", questions: [
            { word: "Linguist", options: ["A person skilled in languages", "A person who avoids speaking", "A person who writes music"], correct: 0 },
            { word: "Bilingual", options: ["Speaking two languages fluently", "Speaking only one language", "Unable to speak any language"], correct: 0 },
            { word: "Lingua franca", options: ["A common language between speakers", "A dead and forgotten language", "A language spoken by one person"], correct: 0 }]
    },
    {
        day: 97, root: "TEMPUS", meaning: "Time", questions: [
            { word: "Temporal", options: ["Relating to worldly or time-bound matters", "Relating to eternal or spiritual things", "Relating to spatial dimensions"], correct: 0 },
            { word: "Contemporary", options: ["Living or occurring at the same time", "From a very distant historical era", "Existing far in the future"], correct: 0 },
            { word: "Extemporaneous", options: ["Done without preparation; impromptu", "Carefully planned and rehearsed", "Written down well in advance"], correct: 0 }]
    },
    {
        day: 98, root: "SEDEO", meaning: "To Sit", questions: [
            { word: "Sedentary", options: ["Involving much sitting; inactive", "Extremely active and energetic", "Moderately physical in nature"], correct: 0 },
            { word: "Sediment", options: ["Matter that settles to the bottom", "Material that floats on top", "Gas that rises to the ceiling"], correct: 0 },
            { word: "Preside", options: ["To sit in authority over; to lead", "To follow orders from a leader", "To sit quietly without authority"], correct: 0 }]
    },
    {
        day: 99, root: "AMBULO", meaning: "To Walk", questions: [
            { word: "Ambulance", options: ["A vehicle for transporting the injured", "A place where people exercise", "A building for storing goods"], correct: 0 },
            { word: "Amble", options: ["To walk at a slow relaxed pace", "To sprint at maximum speed", "To stand perfectly still"], correct: 0 },
            { word: "Preamble", options: ["An introductory statement that walks before", "A concluding final paragraph", "A middle section of a document"], correct: 0 }]
    },
    {
        day: 100, root: "ANIMA", meaning: "Breath/Soul/Life", questions: [
            { word: "Animate", options: ["To give life or motion to", "To kill or destroy completely", "To keep frozen and still"], correct: 0 },
            { word: "Inanimate", options: ["Not alive; lacking life", "Full of life and energy", "Partially alive but dormant"], correct: 0 },
            { word: "Equanimity", options: ["Mental calmness and composure", "Extreme emotional instability", "Physical exhaustion and fatigue"], correct: 0 }]
    },
    {
        day: 101, root: "SIGNUM", meaning: "Sign/Mark", questions: [
            { word: "Signature", options: ["A person's name written in a distinctive way", "A numerical code for identity", "A verbal password"], correct: 0 },
            { word: "Designate", options: ["To appoint or point out", "To remove from a position", "To hide from public view"], correct: 0 },
            { word: "Insignia", options: ["A badge or emblem of rank", "A common piece of clothing", "A type of precious stone"], correct: 0 }]
    },
    {
        day: 102, root: "FLUO", meaning: "To Flow", questions: [
            { word: "Fluent", options: ["Able to express oneself easily", "Struggling to form words", "Speaking in a monotone always"], correct: 0 },
            { word: "Affluent", options: ["Having a great deal of wealth", "Extremely poor and destitute", "Of average financial means"], correct: 0 },
            { word: "Superfluous", options: ["More than what is needed; excess", "Exactly the right amount", "Far too little to be useful"], correct: 0 }]
    },
    {
        day: 103, root: "GRADIOR", meaning: "To Step/Walk", questions: [
            { word: "Graduate", options: ["To advance to a higher level step by step", "To fall back to a lower level", "To remain at the same level"], correct: 0 },
            { word: "Degradation", options: ["A decline to a lower condition", "An improvement in quality", "Maintenance of the status quo"], correct: 0 },
            { word: "Retrograde", options: ["Moving backward; declining", "Moving forward rapidly", "Staying perfectly still"], correct: 0 }]
    },
    {
        day: 104, root: "VERUS", meaning: "True", questions: [
            { word: "Verify", options: ["To confirm the truth of something", "To deny something completely", "To guess without evidence"], correct: 0 },
            { word: "Verity", options: ["A true principle or belief", "A false assumption", "An unproven hypothesis"], correct: 0 },
            { word: "Veracious", options: ["Speaking or representing the truth", "Consistently lying and deceiving", "Making vague statements"], correct: 0 }]
    },
    {
        day: 105, root: "NEGO", meaning: "To Deny", questions: [
            { word: "Negate", options: ["To nullify or make ineffective", "To strongly approve of", "To partially support"], correct: 0 },
            { word: "Renegade", options: ["A person who deserts a cause", "A loyal and faithful follower", "A neutral and impartial observer"], correct: 0 },
            { word: "Abnegation", options: ["The act of renouncing or rejecting", "The act of embracing eagerly", "The act of considering carefully"], correct: 0 }]
    },
    {
        day: 106, root: "VOLO", meaning: "To Wish/Will", questions: [
            { word: "Voluntary", options: ["Done of one's own free will", "Forced and compulsory", "Done without any thought"], correct: 0 },
            { word: "Benevolent", options: ["Wishing good for others", "Wishing harm upon others", "Indifferent to other people"], correct: 0 },
            { word: "Malevolent", options: ["Wishing evil or harm to others", "Kind and generous to everyone", "Completely neutral in feeling"], correct: 0 }]
    },
    {
        day: 107, root: "LEGO", meaning: "To Read/Choose", questions: [
            { word: "Legend", options: ["A traditional story meant to be read", "A scientific formula", "A cooking instruction"], correct: 0 },
            { word: "Legible", options: ["Clear enough to be read", "Too blurry to make out", "Written in invisible ink"], correct: 0 },
            { word: "Elect", options: ["To choose by voting", "To reject a candidate", "To ignore all options"], correct: 0 }]
    },
    {
        day: 108, root: "SEQUOR", meaning: "To Follow", questions: [
            { word: "Sequel", options: ["Something that follows from an earlier event", "Something that came before", "Something completely unrelated"], correct: 0 },
            { word: "Consequence", options: ["A result that follows from an action", "An action that precedes a cause", "A random unrelated event"], correct: 0 },
            { word: "Obsequious", options: ["Excessively eager to follow and please", "Rebellious and defiant", "Calm and self-assured"], correct: 0 }]
    },
    {
        day: 109, root: "PATER", meaning: "Father", questions: [
            { word: "Paternal", options: ["Relating to or like a father", "Relating to or like a mother", "Relating to or like a sibling"], correct: 0 },
            { word: "Patriarch", options: ["The male head of a family", "The youngest child in a family", "A hired servant in a household"], correct: 0 },
            { word: "Patronize", options: ["To treat in a condescending way", "To respect deeply and sincerely", "To ignore entirely"], correct: 0 }]
    },
    {
        day: 110, root: "MATER", meaning: "Mother", questions: [
            { word: "Maternal", options: ["Relating to or like a mother", "Relating to or like a father", "Relating to a distant cousin"], correct: 0 },
            { word: "Matriarch", options: ["The female head of a family", "The youngest daughter", "A foreign diplomat"], correct: 0 },
            { word: "Alma mater", options: ["The school one formerly attended", "A type of classical music", "A foreign government agency"], correct: 0 }]
    },
    {
        day: 111, root: "FRATER", meaning: "Brother", questions: [
            { word: "Fraternal", options: ["Relating to brothers; brotherly", "Relating to mothers only", "Relating to strangers"], correct: 0 },
            { word: "Fraternity", options: ["A brotherhood or male social group", "A solitary lifestyle", "A competitive sports league"], correct: 0 },
            { word: "Fraternize", options: ["To associate with others in a friendly way", "To argue violently with others", "To completely avoid all contact"], correct: 0 }]
    },
    {
        day: 112, root: "SANGUIS", meaning: "Blood", questions: [
            { word: "Sanguine", options: ["Optimistic or positive, especially in a bad situation", "Pessimistic and gloomy always", "Completely indifferent to outcomes"], correct: 0 },
            { word: "Consanguinity", options: ["The state of sharing the same blood or ancestry", "A lack of any family connection", "A friendship between strangers"], correct: 0 },
            { word: "Sanguinary", options: ["Involving or causing much bloodshed", "Peaceful and non-violent", "Mildly unpleasant but harmless"], correct: 0 }]
    },
    {
        day: 113, root: "CORPUS", meaning: "Body", questions: [
            { word: "Corporal", options: ["Relating to the human body", "Relating to the human mind", "Relating to spiritual matters"], correct: 0 },
            { word: "Corpulent", options: ["Having a large, bulky body", "Extremely thin and frail", "Of average build and size"], correct: 0 },
            { word: "Incorporate", options: ["To include as part of a whole body", "To exclude from the group", "To separate into small pieces"], correct: 0 }]
    },
    {
        day: 114, root: "CAPUT", meaning: "Head", questions: [
            { word: "Capital", options: ["The chief city; wealth; of the head", "A small village in the countryside", "A remote island in the ocean"], correct: 0 },
            { word: "Decapitate", options: ["To cut off the head", "To put on a hat or crown", "To heal a head injury"], correct: 0 },
            { word: "Captain", options: ["A leader; head of a group", "The lowest-ranking member", "A person with no authority"], correct: 0 }]
    },
    {
        day: 115, root: "PES", meaning: "Foot", questions: [
            { word: "Pedestrian", options: ["A person walking on foot", "A person riding a horse", "A person driving a car"], correct: 0 },
            { word: "Impede", options: ["To hinder or obstruct passage of feet", "To help someone walk faster", "To carry someone on your back"], correct: 0 },
            { word: "Expedite", options: ["To free the feet; speed up a process", "To slow down deliberately", "To block all forward motion"], correct: 0 }]
    },
    {
        day: 116, root: "OCULUS", meaning: "Eye", questions: [
            { word: "Ocular", options: ["Relating to the eyes or vision", "Relating to hearing and sound", "Relating to taste and smell"], correct: 0 },
            { word: "Binoculars", options: ["An optical instrument for both eyes", "A single-lens magnifying glass", "A device for recording sound"], correct: 0 },
            { word: "Inoculate", options: ["To introduce a substance (originally through the eye of a needle)", "To remove a harmful substance", "To cover with a dark cloth"], correct: 0 }]
    },
    {
        day: 117, root: "AUDIO", meaning: "To Hear", questions: [
            { word: "Audible", options: ["Loud enough to be heard", "Too quiet to be heard", "Visible to the naked eye"], correct: 0 },
            { word: "Audience", options: ["A group of listeners or spectators", "A single performer on stage", "A written book or document"], correct: 0 },
            { word: "Auditorium", options: ["A large room for hearing performances", "A small private office", "An outdoor parking structure"], correct: 0 }]
    },
    {
        day: 118, root: "TERRA", meaning: "Earth/Land", questions: [
            { word: "Terrain", options: ["An area of land with specific features", "A body of water like a lake", "A section of the atmosphere"], correct: 0 },
            { word: "Terrestrial", options: ["Relating to the earth or land", "Relating to outer space", "Relating to the deep ocean"], correct: 0 },
            { word: "Subterranean", options: ["Existing beneath the earth's surface", "Floating above the clouds", "Located on the water's surface"], correct: 0 }]
    },
    {
        day: 119, root: "AQUA", meaning: "Water", questions: [
            { word: "Aquatic", options: ["Relating to water", "Relating to fire", "Relating to air and wind"], correct: 0 },
            { word: "Aqueduct", options: ["A channel for carrying water", "A bridge for carrying trains", "A tunnel through a mountain"], correct: 0 },
            { word: "Aquifer", options: ["An underground layer that holds water", "A surface lake or pond", "A cloud formation in the sky"], correct: 0 }]
    },
    {
        day: 120, root: "IGNIS", meaning: "Fire", questions: [
            { word: "Ignite", options: ["To set on fire; to catch fire", "To extinguish a flame", "To freeze solid"], correct: 0 },
            { word: "Ignition", options: ["The process of starting to burn", "The process of cooling down", "The process of melting ice"], correct: 0 },
            { word: "Igneous", options: ["Relating to or produced by fire", "Relating to water erosion", "Relating to wind patterns"], correct: 0 }]
    },
    {
        day: 121, root: "LUMEN", meaning: "Light", questions: [
            { word: "Luminous", options: ["Giving off light; bright", "Completely dark and shadowy", "Of medium brightness"], correct: 0 },
            { word: "Illuminate", options: ["To light up or make clear", "To darken or obscure", "To leave in shadow"], correct: 0 },
            { word: "Luminary", options: ["A person who inspires or influences others", "A person who follows blindly", "A shy and retiring individual"], correct: 0 }]
    },
    {
        day: 122, root: "VACO", meaning: "To Be Empty", questions: [
            { word: "Vacant", options: ["Empty; not occupied", "Completely full and crowded", "Partially occupied"], correct: 0 },
            { word: "Vacuum", options: ["A space entirely empty of matter", "A space packed with objects", "A moderately filled container"], correct: 0 },
            { word: "Evacuate", options: ["To remove people from a place", "To fill a place with people", "To lock all exits shut"], correct: 0 }]
    },
    {
        day: 123, root: "NEGO", meaning: "Business/Busy", questions: [
            { word: "Negotiate", options: ["To discuss terms for an agreement", "To refuse all discussion", "To accept without question"], correct: 0 },
            { word: "Negligent", options: ["Failing to take proper care", "Extremely careful and diligent", "Moderately attentive"], correct: 0 },
            { word: "Negligible", options: ["So small as to not be worth considering", "Extremely large and important", "Of moderate significance"], correct: 0 }]
    },
    {
        day: 124, root: "SIMILIS", meaning: "Like/Similar", questions: [
            { word: "Simulate", options: ["To imitate or reproduce", "To create something entirely new", "To destroy an existing model"], correct: 0 },
            { word: "Facsimile", options: ["An exact copy or reproduction", "A rough and inaccurate sketch", "An original one-of-a-kind piece"], correct: 0 },
            { word: "Assimilate", options: ["To absorb and make similar", "To reject and push away", "To examine without changing"], correct: 0 }]
    },
    {
        day: 125, root: "DOMUS", meaning: "House/Home", questions: [
            { word: "Domestic", options: ["Relating to the home or household", "Relating to foreign countries", "Relating to outer space"], correct: 0 },
            { word: "Domicile", options: ["A place of residence; a home", "A workplace or office", "A vacation destination"], correct: 0 },
            { word: "Domesticate", options: ["To tame an animal for home life", "To release into the wild", "To hunt for sport"], correct: 0 }]
    },
    {
        day: 126, root: "URBS", meaning: "City", questions: [
            { word: "Urban", options: ["Relating to a city or town", "Relating to the countryside", "Relating to the wilderness"], correct: 0 },
            { word: "Suburban", options: ["An area just outside a city", "The central downtown area", "A remote mountain region"], correct: 0 },
            { word: "Urbane", options: ["Suave, courteous, and refined", "Rude and unsophisticated", "Shy and awkward in manner"], correct: 0 }]
    },
    {
        day: 127, root: "CIVIS", meaning: "Citizen", questions: [
            { word: "Civic", options: ["Relating to citizens or a city", "Relating to military service", "Relating to religious matters"], correct: 0 },
            { word: "Civilize", options: ["To bring to a state of social development", "To make more primitive", "To isolate from all society"], correct: 0 },
            { word: "Civil", options: ["Courteous and polite", "Rude and offensive", "Completely indifferent"], correct: 0 }]
    },
    {
        day: 128, root: "BELLUM", meaning: "War", questions: [
            { word: "Belligerent", options: ["Hostile, aggressive, ready to fight", "Peaceful and gentle always", "Neutral and uninvolved"], correct: 0 },
            { word: "Antebellum", options: ["Before the war", "After the war ended", "During the height of the war"], correct: 0 },
            { word: "Rebel", options: ["One who wages war against authority", "One who follows all rules", "One who is indifferent to power"], correct: 0 }]
    },
    {
        day: 129, root: "PAX", meaning: "Peace", questions: [
            { word: "Pacify", options: ["To bring to a state of peace", "To incite a riot or conflict", "To observe without acting"], correct: 0 },
            { word: "Pacific", options: ["Peaceful in character or intent", "Warlike and aggressive", "Chaotic and disordered"], correct: 0 },
            { word: "Pact", options: ["A formal agreement or treaty of peace", "A declaration of war", "A casual verbal promise"], correct: 0 }]
    },
    {
        day: 130, root: "VALE", meaning: "To Be Strong/Well", questions: [
            { word: "Valid", options: ["Having a sound basis; strong", "Completely incorrect and weak", "Of uncertain accuracy"], correct: 0 },
            { word: "Prevalent", options: ["Widespread; having strong influence", "Rare and seldom encountered", "Of no significance at all"], correct: 0 },
            { word: "Valiant", options: ["Possessing great courage and bravery", "Cowardly and timid in nature", "Lazy and unwilling to act"], correct: 0 }]
    },
    {
        day: 131, root: "GRATUS", meaning: "Pleasing/Thankful", questions: [
            { word: "Gratitude", options: ["The quality of being thankful", "A feeling of intense anger", "A sense of deep confusion"], correct: 0 },
            { word: "Gratify", options: ["To give pleasure or satisfaction", "To cause pain or discomfort", "To leave someone indifferent"], correct: 0 },
            { word: "Ingrate", options: ["An ungrateful person", "A very thankful person", "A person with no opinion"], correct: 0 }]
    },
    {
        day: 132, root: "JURO", meaning: "To Swear/Law", questions: [
            { word: "Jury", options: ["A body sworn to give a verdict", "A single judge in a courtroom", "A team of lawyers"], correct: 0 },
            { word: "Perjury", options: ["The offense of lying under oath", "A legal defense strategy", "A type of courtroom procedure"], correct: 0 },
            { word: "Jurisdiction", options: ["The official power to make legal decisions", "A personal opinion on a matter", "A type of academic degree"], correct: 0 }]
    },
    {
        day: 133, root: "ERRO", meaning: "To Wander", questions: [
            { word: "Errant", options: ["Traveling in search of adventure; straying", "Staying fixed in one position", "Following a strict routine"], correct: 0 },
            { word: "Aberration", options: ["A departure from what is normal", "A perfectly standard outcome", "An expected and typical result"], correct: 0 },
            { word: "Errand", options: ["A short journey for a purpose", "A long permanent relocation", "A leisurely vacation trip"], correct: 0 }]
    },
    {
        day: 134, root: "PUNCTUM", meaning: "Point/Pierce", questions: [
            { word: "Punctual", options: ["Happening at the exact agreed time point", "Always running late", "Having no awareness of time"], correct: 0 },
            { word: "Puncture", options: ["To make a small hole by piercing", "To seal a hole completely", "To fill with air or liquid"], correct: 0 },
            { word: "Compunction", options: ["A feeling of guilt that pricks the conscience", "A sense of complete freedom", "A moment of great happiness"], correct: 0 }]
    },
    {
        day: 135, root: "VOLVO", meaning: "To Roll/Turn", questions: [
            { word: "Revolve", options: ["To move in a circle; turn around", "To remain completely stationary", "To move in a straight line"], correct: 0 },
            { word: "Evolution", options: ["Gradual development rolling forward", "A sudden and immediate change", "Complete stagnation over time"], correct: 0 },
            { word: "Involve", options: ["To include or roll into something", "To exclude from participation", "To simplify by removing parts"], correct: 0 }]
    },
    {
        day: 136, root: "SANUS", meaning: "Healthy/Sound", questions: [
            { word: "Sane", options: ["Of sound mind; reasonable", "Mentally unstable and irrational", "Neither healthy nor unhealthy"], correct: 0 },
            { word: "Sanitary", options: ["Relating to conditions of cleanliness", "Dirty and unhygienic", "Moderately clean at best"], correct: 0 },
            { word: "Insanity", options: ["The state of being seriously mentally ill", "Perfect mental health", "Mild confusion or forgetfulness"], correct: 0 }]
    },
    {
        day: 137, root: "DOLEO", meaning: "To Grieve/Feel Pain", questions: [
            { word: "Doleful", options: ["Expressing sorrow; mournful", "Extremely happy and cheerful", "Completely without emotion"], correct: 0 },
            { word: "Condolences", options: ["Expressions of sympathy for grief", "Expressions of congratulations", "Expressions of indifference"], correct: 0 },
            { word: "Indolent", options: ["Wanting to avoid activity; lazy", "Extremely active and energetic", "Moderately busy and occupied"], correct: 0 }]
    },
    {
        day: 138, root: "NOCEO", meaning: "To Harm", questions: [
            { word: "Innocent", options: ["Not guilty; not causing harm", "Extremely guilty and harmful", "Partially responsible"], correct: 0 },
            { word: "Noxious", options: ["Harmful, poisonous, or very unpleasant", "Beneficial and health-promoting", "Completely neutral in effect"], correct: 0 },
            { word: "Obnoxious", options: ["Extremely unpleasant and offensive", "Charming and delightful always", "Mildly annoying at worst"], correct: 0 }]
    },
    {
        day: 139, root: "CULPA", meaning: "Blame/Fault", questions: [
            { word: "Culpable", options: ["Deserving blame; guilty", "Completely innocent of a charge", "Partially involved but blameless"], correct: 0 },
            { word: "Culprit", options: ["A person responsible for an offense", "A victim of a crime", "A witness to an event"], correct: 0 },
            { word: "Exculpate", options: ["To free from blame", "To assign greater blame", "To keep under suspicion"], correct: 0 }]
    },
    {
        day: 140, root: "LUCRUM", meaning: "Profit/Gain", questions: [
            { word: "Lucrative", options: ["Producing a great deal of profit", "Causing a financial loss", "Breaking even without gain"], correct: 0 },
            { word: "Lucre", options: ["Money, especially viewed as sordid", "A type of precious metal", "A financial instrument"], correct: 0 },
            { word: "Lucrativness", options: ["The quality of being profitable", "The state of being bankrupt", "Average financial performance"], correct: 0 }]
    },
    {
        day: 141, root: "MIRUS", meaning: "Wonderful", questions: [
            { word: "Miracle", options: ["An extraordinary and welcome event", "A common everyday occurrence", "A tragic and terrible disaster"], correct: 0 },
            { word: "Admire", options: ["To regard with respect and wonder", "To despise completely", "To ignore without interest"], correct: 0 },
            { word: "Mirage", options: ["A wonderful optical illusion", "A solid and real structure", "A type of recorded music"], correct: 0 }]
    },
    {
        day: 142, root: "SACER", meaning: "Sacred/Holy", questions: [
            { word: "Sacred", options: ["Connected with God; holy", "Completely ordinary and mundane", "Profane and disrespectful"], correct: 0 },
            { word: "Sacrifice", options: ["To give up something precious as an offering", "To take something by force", "To save something for later"], correct: 0 },
            { word: "Sacrilege", options: ["Violation of something sacred", "A devout act of worship", "A neutral and harmless action"], correct: 0 }]
    },
    {
        day: 143, root: "SANCTUS", meaning: "Holy", questions: [
            { word: "Sanctify", options: ["To make holy or sacred", "To make profane or impure", "To leave entirely unchanged"], correct: 0 },
            { word: "Sanctuary", options: ["A holy or sacred place of refuge", "A common marketplace", "A military training ground"], correct: 0 },
            { word: "Sanction", options: ["Official permission or approval", "An illegal act of rebellion", "A casual suggestion"], correct: 0 }]
    },
    {
        day: 144, root: "FELIX", meaning: "Happy/Fortunate", questions: [
            { word: "Felicity", options: ["Intense happiness", "Extreme sadness and grief", "A state of mild boredom"], correct: 0 },
            { word: "Felicitous", options: ["Well-suited for the occasion; pleasing", "Completely inappropriate", "Neither good nor bad"], correct: 0 },
            { word: "Infelicitous", options: ["Unfortunate; inappropriate", "Very lucky and fortunate", "Perfectly timed and apt"], correct: 0 }]
    },
    {
        day: 145, root: "CERNO", meaning: "To Separate/Judge", questions: [
            { word: "Discern", options: ["To perceive or judge clearly", "To confuse or mix up", "To ignore completely"], correct: 0 },
            { word: "Discreet", options: ["Careful and judicious in behavior", "Loud and attention-seeking", "Reckless and thoughtless"], correct: 0 },
            { word: "Criterion", options: ["A standard for judging or deciding", "A random and arbitrary choice", "A method of avoiding decisions"], correct: 0 }]
    },
    {
        day: 146, root: "MOVEO", meaning: "To Move", questions: [
            { word: "Promote", options: ["To move forward; advance in rank", "To move backward; demote", "To stay at the same level"], correct: 0 },
            { word: "Emotion", options: ["A strong feeling that moves the mind", "A logical mathematical proof", "A type of physical exercise"], correct: 0 },
            { word: "Commotion", options: ["A state of confused and noisy movement", "Complete stillness and quiet", "A gentle and peaceful scene"], correct: 0 }]
    },
    {
        day: 147, root: "VERBUM", meaning: "Word", questions: [
            { word: "Verbose", options: ["Using more words than needed", "Using very few words", "Choosing words perfectly"], correct: 0 },
            { word: "Proverb", options: ["A short, well-known saying", "A long and detailed novel", "A mathematical equation"], correct: 0 },
            { word: "Verbatim", options: ["In exactly the same words", "In a completely different version", "In a shortened summary form"], correct: 0 }]
    },
    {
        day: 148, root: "MEMOR", meaning: "Mindful/Remember", questions: [
            { word: "Memorial", options: ["Something that serves as a remembrance", "Something easily forgotten", "Something meant to be destroyed"], correct: 0 },
            { word: "Commemorate", options: ["To recall and show respect for", "To forget deliberately", "To ignore and move past"], correct: 0 },
            { word: "Immemorial", options: ["Extending beyond the reach of memory", "Very recent and fresh", "Easily dated and timed"], correct: 0 }]
    },
    {
        day: 149, root: "GRAVO", meaning: "Heavy", questions: [
            { word: "Gravity", options: ["The force of attraction; seriousness", "A feeling of extreme lightness", "A state of mild amusement"], correct: 0 },
            { word: "Aggravate", options: ["To make worse or more serious", "To make lighter and better", "To leave entirely unchanged"], correct: 0 },
            { word: "Grave", options: ["Serious and weighty in nature", "Light-hearted and humorous", "Playful and carefree always"], correct: 0 }]
    },
    {
        day: 150, root: "LABOR", meaning: "Work/Toil", questions: [
            { word: "Laborious", options: ["Requiring considerable effort", "Extremely easy and effortless", "Moderately challenging"], correct: 0 },
            { word: "Collaborate", options: ["To work together with others", "To work alone in isolation", "To refuse to participate"], correct: 0 },
            { word: "Elaborate", options: ["Involving many careful details; developed", "Simple and straightforward", "Incomplete and unfinished"], correct: 0 }]
    },
];
