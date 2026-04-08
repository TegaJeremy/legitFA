import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "yo" | "ig" | "ur" | "fr" | "ar" | "la" | "ef";

const translations: Record<string, Record<Language, string>> = {
  "nav.home": { en: "Home", yo: "Ilé", ig: "Ụlọ", ur: "Owa", fr: "Accueil", ar: "الرئيسية", la: "Domus", ef: "Eka" },
  "nav.team": { en: "Team", yo: "Ẹgbẹ́", ig: "Ndị egwuregwu", ur: "Ẹgbẹ", fr: "Équipe", ar: "الفريق", la: "Turma", ef: "Ikpọn" },
  "nav.matches": { en: "Matches", yo: "Eré", ig: "Asọmpi", ur: "Eré", fr: "Matchs", ar: "المباريات", la: "Certamina", ef: "Ikpọn" },
  "nav.stats": { en: "Stats", yo: "Àkọsílẹ̀", ig: "Ọnụọgụ", ur: "Àkọsílẹ̀", fr: "Stats", ar: "الإحصائيات", la: "Numeri", ef: "Ọfiọn" },
  "nav.training": { en: "Training", yo: "Ìdánilẹ́kọ̀ọ́", ig: "Ọzụzụ", ur: "Ìdánilẹ́kọ̀ọ́", fr: "Entraînement", ar: "التدريب", la: "Exercitium", ef: "Ẹkpẹdẹ" },
  "nav.admin": { en: "Admin", yo: "Alákòóso", ig: "Onye njikwa", ur: "Alákòóso", fr: "Admin", ar: "المشرف", la: "Admin", ef: "Ọfiọn" },
  "hero.title": { en: "Legit Boys FA", yo: "Legit Boys FA", ig: "Legit Boys FA", ur: "Legit Boys FA", fr: "Legit Boys FA", ar: "Legit Boys FA", la: "Legit Boys FA", ef: "Legit Boys FA" },
  "hero.subtitle": { en: "Nurturing Champions from Ajegunle", yo: "A ń tọ́ àwọn olùborí láti Ajegunle", ig: "Na-azụ ndị mmeri si Ajegunle", ur: "A ń tọ́ àwọn olùborí láti Ajegunle", fr: "Former des champions d'Ajegunle", ar: "رعاية الأبطال من أجيغونلي", la: "Campiones ab Ajegunle nutriens", ef: "Ẹkpẹdẹ ọkpọsọ si Ajegunle" },
  "hero.cta.join": { en: "Join the Academy", yo: "Darapọ̀ mọ́ ilé-ẹ̀kọ́", ig: "Sonye akwụkwọ", ur: "Darapọ̀ mọ́ ilé-ẹ̀kọ́", fr: "Rejoindre l'académie", ar: "انضم للأكاديمية", la: "Academiam adiunge", ef: "Ẹkpẹdẹ ikpọn" },
  "hero.cta.team": { en: "View Team", yo: "Wo Ẹgbẹ́", ig: "Lee ndị egwuregwu", ur: "Wo Ẹgbẹ́", fr: "Voir l'équipe", ar: "عرض الفريق", la: "Turmam vide", ef: "Kọn ikpọn" },
  "hero.location": { en: "Ajegunle, Olodi Apapa, Lagos, Nigeria", yo: "Ajegunle, Olodi Apapa, Lagos, Nigeria", ig: "Ajegunle, Olodi Apapa, Lagos, Nigeria", ur: "Ajegunle, Olodi Apapa, Lagos, Nigeria", fr: "Ajegunle, Olodi Apapa, Lagos, Nigéria", ar: "أجيغونلي، أولودي أبابا، لاغوس، نيجيريا", la: "Ajegunle, Olodi Apapa, Lagos, Nigeria", ef: "Ajegunle, Olodi Apapa, Lagos, Nigeria" },
  "about.title": { en: "About the Academy", yo: "Nípa Ilé-ẹ̀kọ́", ig: "Maka Akwụkwọ", ur: "Nípa Ilé-ẹ̀kọ́", fr: "À propos", ar: "عن الأكاديمية", la: "De Academia", ef: "Ẹkpẹdẹ ikpọn" },
  "about.text": { en: "Legit Boys Football Academy is a grassroots football development program based in Ajegunle, Lagos. We discover, nurture, and develop young talented players, providing them with the skills and discipline to excel both on and off the pitch.", yo: "Legit Boys Football Academy jẹ́ ètò ìdàgbàsókè bọ́ọ̀lù tí ó wà ní Ajegunle, Lagos. A ń ṣàwárí, tọ́jú, àti mú àwọn ọ̀dọ́ oníṣẹ́ dàgbà.", ig: "Legit Boys Football Academy bụ mmemme mmepe bọọlụ nkwụsị na Ajegunle, Lagos. Anyị na-achọpụta, na-azụ, ma na-eme ka ụmụaka nwere talent too.", ur: "Legit Boys Football Academy jẹ́ ètò ìdàgbàsókè bọ́ọ̀lù tí ó wà ní Ajegunle, Lagos.", fr: "La Legit Boys Football Academy est un programme de développement du football basé à Ajegunle, Lagos.", ar: "أكاديمية ليجيت بويز لكرة القدم هي برنامج تطوير كرة القدم في أجيغونلي، لاغوس.", la: "Legit Boys Football Academia est programma evolutionis pilae pedis in Ajegunle, Lagos.", ef: "Legit Boys Football Academy kọn ẹkpẹdẹ ọkpọsọ si Ajegunle, Lagos." },
  "gallery.title": { en: "Gallery", yo: "Àwòrán", ig: "Foto", ur: "Àwòrán", fr: "Galerie", ar: "معرض الصور", la: "Picturae", ef: "Ọfiọn" },
  "team.title": { en: "Meet the Team", yo: "Pàdé Ẹgbẹ́", ig: "Zute Ndị Egwuregwu", ur: "Pàdé Ẹgbẹ́", fr: "L'équipe", ar: "تعرف على الفريق", la: "Occurre Turmae", ef: "Kọn ikpọn" },
  "matches.title": { en: "Match Results", yo: "Àbájáde Eré", ig: "Nsonaazụ Asọmpi", ur: "Àbájáde Eré", fr: "Résultats", ar: "نتائج المباريات", la: "Eventus", ef: "Ọfiọn ikpọn" },
  "stats.title": { en: "Player Stats", yo: "Àkọsílẹ̀ Oṣèré", ig: "Ọnụọgụ Ndị Egwuregwu", ur: "Àkọsílẹ̀ Oṣèré", fr: "Statistiques", ar: "إحصائيات اللاعبين", la: "Numeri Lusorum", ef: "Ọfiọn ọkpọsọ" },
  "training.title": { en: "Training Teams", yo: "Ẹgbẹ́ Ìdánilẹ́kọ̀ọ́", ig: "Ndị Ọzụzụ", ur: "Ẹgbẹ́ Ìdánilẹ́kọ̀ọ́", fr: "Équipes d'entraînement", ar: "فرق التدريب", la: "Turmae Exercitii", ef: "Ẹkpẹdẹ ikpọn" },
  "admin.title": { en: "Admin Dashboard", yo: "Pánẹ́lì Alákòóso", ig: "Dashboard Onye njikwa", ur: "Pánẹ́lì Alákòóso", fr: "Tableau de bord", ar: "لوحة المشرف", la: "Tabula Administrationis", ef: "Ọfiọn admin" },
  "footer.tagline": { en: "Building Champions, One Goal at a Time", yo: "A ń kọ́ àwọn Olùborí, Góólù Kan Lẹ́ẹ̀kan", ig: "Na-ewu Ndị Mmeri, Otu Gol N'oge", ur: "A ń kọ́ àwọn Olùborí", fr: "Former des champions, un but à la fois", ar: "بناء الأبطال، هدف واحد في كل مرة", la: "Campiones aedificans", ef: "Ẹkpẹdẹ ọkpọsọ" },
  "empty.players": { en: "No players yet", yo: "Kò sí oṣèré", ig: "Enweghị ndị egwuregwu", ur: "Kò sí oṣèré", fr: "Aucun joueur", ar: "لا يوجد لاعبون", la: "Nulli lusores", ef: "Ọfiọn" },
  "empty.matches": { en: "No matches yet", yo: "Kò sí eré", ig: "Enweghị asọmpi", ur: "Kò sí eré", fr: "Aucun match", ar: "لا توجد مباريات", la: "Nulla certamina", ef: "Ọfiọn" },
  "loading": { en: "Loading...", yo: "Ń gbéwọlé...", ig: "Na-ebu...", ur: "Ń gbéwọlé...", fr: "Chargement...", ar: "جار التحميل...", la: "Onerans...", ef: "Ọfiọn..." },
};

type I18nContextType = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>("en");
  const t = (key: string) => translations[key]?.[lang] || translations[key]?.en || key;
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yorùbá" },
  { code: "ig", label: "Igbo" },
  { code: "ur", label: "Urhobo" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "la", label: "Latin" },
  { code: "ef", label: "Calabar" },
];
