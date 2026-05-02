"use client";

import { motion } from "framer-motion";
import { UserPlus, FilePlus, LayoutDashboard, type LucideIcon } from "lucide-react";

const stepItems: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: UserPlus,
    title: "1. Account aanmaken",
    text: "Binnen 2 minuten gepiept. Geen creditcard of KvK vereist.",
  },
  {
    icon: FilePlus,
    title: "2. Vacature plaatsen",
    text: "Vul het eenvoudige formulier in. Uw vacature is direct zichtbaar voor talent.",
  },
  {
    icon: LayoutDashboard,
    title: "3. Dashboard live",
    text: "Beheer vacatures en sollicitaties centraal vanuit uw dashboard.",
  },
];

export default function EmployerStepReveal() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {stepItems.map((step, idx) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: idx * 0.12, ease: "easeOut" }}
          className="relative bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center mb-5">
            <step.icon className="h-6 w-6 text-primary" strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-bold text-black mb-2">{step.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{step.text}</p>
        </motion.div>
      ))}
    </div>
  );
}
