import { Component } from '@angular/core';
import { LegalPage, LegalSection } from '../../shared/components/legal-page';

@Component({
  selector: 'app-privacy',
  imports: [LegalPage],
  template: `<app-legal-page
    title="Politique de confidentialité"
    subtitle="Comment CampusFlow traite tes données."
    [sections]="sections"
  />`,
})
export class Privacy {
  readonly sections: LegalSection[] = [
    { title: 'Données collectées', text: "Nous collectons ton nom, ton adresse e-mail, ta filière, ton niveau et ta progression d'étude, uniquement pour faire fonctionner la plateforme." },
    { title: 'Utilisation des données', text: "Tes données servent à personnaliser ton planning, tes quiz et les recommandations de l'assistant IA. Elles ne sont jamais vendues." },
    { title: 'Sécurité', text: "Les mots de passe sont chiffrés et l'accès aux espaces étudiant et administrateur est protégé par authentification." },
    { title: 'Tes droits', text: "Tu peux modifier tes informations depuis ton profil et demander la suppression de ton compte via la page Contact." },
  ];
}