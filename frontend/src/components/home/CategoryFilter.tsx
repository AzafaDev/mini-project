import { motion } from "framer-motion";

interface Category {
  icon: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
      {categories.map((cat) => (
        <motion.button
          whileTap={{ scale: 0.95 }}
          key={cat.label}
          onClick={() => onCategoryChange(cat.label)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
            activeCategory === cat.label
              ? "bg-[#c0c1ff] text-[#1000a9] shadow-[0_0_20px_rgba(192,193,255,0.4)]"
              : "bg-[#2a2a2a] hover:bg-[#393939] text-[#c7c4d8] hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {cat.icon}
          </span>{" "}
          {cat.label}
        </motion.button>
      ))}
    </div>
  );
};
