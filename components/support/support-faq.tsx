import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "À quoi correspondent les colonnes du tableau Kanban ?",
    answer:
      "Chaque colonne représente le statut d'un projet : « À faire », « En cours », « Bloqué », « Terminé » et « Rejeté ». Déplacer un projet d'une colonne à l'autre met à jour son statut automatiquement.",
  },
  {
    question:
      "Quelle est la différence entre un projet d'édition et un projet d'impression ?",
    answer:
      "Le type de projet (Édition ou Impression) détermine la liste de tâches créée automatiquement à la création du projet, configurable dans Paramètres.",
  },
  {
    question: "Qui peut voir et modifier un projet ?",
    answer:
      "Seuls les administrateurs et les membres assignés à un projet peuvent le consulter et le modifier. Si un projet ne vous concerne pas, il n'apparaît pas dans votre tableau de bord.",
  },
  {
    question: "Pourquoi je ne vois pas l'email de certains auteurs ?",
    answer:
      "Par confidentialité, l'email d'un auteur n'est visible que si vous partagez au moins un projet avec lui, ou si vous êtes administrateur.",
  },
  {
    question: "J'ai oublié mon mot de passe, que faire ?",
    answer:
      "Sur l'écran de connexion, cliquez sur « Mot de passe oublié ? » et suivez les instructions envoyées par email. Le lien de réinitialisation expire au bout d'une heure.",
  },
  {
    question: "Comment ajouter un auteur ou un membre à un projet ?",
    answer:
      "Depuis la fiche d'un projet, utilisez le sélecteur d'auteur et le sélecteur de membres pour les associer au projet. Seuls les membres assignés reçoivent les notifications liées à ce projet.",
  },
];

export function SupportFaq() {
  return (
    <Accordion>
      {FAQ_ITEMS.map((item, index) => (
        <AccordionItem key={item.question} value={`item-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
