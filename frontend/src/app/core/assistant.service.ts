import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface Recommendation {
  tag: string;
  title: string;
  hint: string;
}

/**
 * Service MOCK de l'assistant IA : réponses préparées selon des mots-clés.
 * À remplacer par un appel au backend (qui appellera l'API du modèle de langage,
 * pour protéger la clé) quand il existera.
 */
@Injectable({ providedIn: 'root' })
export class AssistantService {
  private readonly answers: { keywords: string[]; text: string }[] = [
    {
      keywords: ['routage', 'rip', 'ospf'],
      text: "Le routage dynamique permet aux routeurs d'échanger leurs tables automatiquement (RIP, OSPF). Veux-tu un exemple ou un quiz ?",
    },
    {
      keywords: ['sql', 'jointure', 'requête'],
      text: 'En SQL, une jointure combine des lignes de deux tables grâce à une clé commune (INNER JOIN, LEFT JOIN...). Je peux te proposer des exercices.',
    },
    {
      keywords: ['arbre', 'arbres', 'binaire'],
      text: 'Un arbre binaire est une structure où chaque nœud a au plus deux fils. Les parcours classiques sont préfixe, infixe et suffixe.',
    },
    {
      keywords: ['quiz', 'test'],
      text: 'Bonne idée ! Dis-moi la matière et le chapitre, et je te prépare un quiz adapté à ton niveau.',
    },
    {
      keywords: ['plan', 'planning', 'révision', 'revision'],
      text: "Je peux générer un plan d'étude à partir de tes examens et de tes points faibles. Commence par ajouter tes examens dans le Planning.",
    },
  ];

  private readonly fallback =
    "Je n'ai pas encore la réponse à cette question dans cette version de démonstration. Essaie avec : routage, SQL, arbres, quiz ou plan d'étude.";

  readonly recommendations: Recommendation[] = [
    { tag: 'Ch.3', title: 'Routage', hint: 'Chapitre à réviser' },
    { tag: 'SQL', title: 'Jointures', hint: 'Exercices conseillés' },
  ];

  /** Simule la réponse de l'IA avec un délai réseau. */
  ask(question: string): Observable<string> {
    const q = question.toLowerCase();
    const match = this.answers.find((a) => a.keywords.some((k) => q.includes(k)));
    return of(match ? match.text : this.fallback).pipe(delay(900));
  }
}
