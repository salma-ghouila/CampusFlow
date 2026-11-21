import { Component } from '@angular/core';
import { LegalPage, LegalSection } from '../../shared/components/legal-page';

@Component({
  selector: 'app-terms',
  imports: [LegalPage],
  template: `<app-legal-page
    title="Conditions d'utilisation"
    subtitle="Les règles d'usage de CampusFlow."
    [sections]="sections"
  />`,
})
export class Terms {
  readonly sections: LegalSection[] = [
    {
      title: 'Accès au service',
      text: 'CampusFlow est réservé aux étudiants inscrits. Tu es responsable de la confidentialité de ton mot de passe.',
    },
    {
      title: 'Ressources partagées',
      text: "Tu ne dois déposer que des contenus dont tu es l'auteur ou que tu as le droit de partager. Les contenus inappropriés peuvent être supprimés.",
    },
    {
      title: 'Comportement',
      text: "Dans les groupes d'étude, le respect des autres étudiants est obligatoire. Les comptes abusifs peuvent être suspendus par un administrateur.",
    },
    {
      title: 'Évolution du service',
      text: 'Les fonctionnalités peuvent évoluer. Les présentes conditions peuvent être mises à jour.',
    },
  ];
}
