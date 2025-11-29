import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'so', name: 'Soomaali', flag: '🇸🇴' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
              i18n.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
