import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface Question {
  id: number;
  text: string;
  options: string[];
  answer: number; // index de la bonne réponse
  explanation: string;
}

export interface QuizHistoryItem {
  title: string;
  subject: string;
  score: number; // sur 20
}

/**
 * Service MOCK des quiz : questions préparées en mémoire.
 * À remplacer par un appel au backend (qui interrogera l'IA) plus tard.
 */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly bank: Record<string, Question[]> = {
    Réseaux: [
      {
        id: 1,
        text: "Quel protocole de routage dynamique utilise l'algorithme de Dijkstra ?",
        options: ['RIP', 'OSPF', 'ARP', 'DNS'],
        answer: 1,
        explanation:
          'OSPF calcule les routes avec Dijkstra, alors que RIP utilise le nombre de sauts.',
      },
      {
        id: 2,
        text: 'Quelle métrique utilise RIP ?',
        options: ['La bande passante', 'Le nombre de sauts', 'Le délai', 'Le coût administratif'],
        answer: 1,
        explanation: 'RIP utilise le nombre de sauts comme métrique.',
      },
      {
        id: 3,
        text: 'Une table de routage associe un réseau à…',
        options: ['Une adresse MAC', 'Un prochain saut', 'Un port TCP', 'Un nom de domaine'],
        answer: 1,
        explanation: 'Elle associe un réseau de destination à un prochain saut.',
      },
    ],
    'Bases de données': [
      {
        id: 1,
        text: 'Quelle clause combine deux tables ?',
        options: ['GROUP BY', 'ORDER BY', 'JOIN', 'LIMIT'],
        answer: 2,
        explanation: 'JOIN combine des lignes de deux tables via une clé commune.',
      },
      {
        id: 2,
        text: 'Quelle commande supprime des lignes ?',
        options: ['DROP', 'DELETE', 'REMOVE', 'CLEAR'],
        answer: 1,
        explanation: 'DELETE supprime des lignes ; DROP supprime la table entière.',
      },
      {
        id: 3,
        text: 'Une clé primaire doit être…',
        options: ['Nulle', 'Unique', 'Répétée', 'Textuelle'],
        answer: 1,
        explanation: 'Une clé primaire identifie chaque ligne de façon unique.',
      },
    ],
    Algorithmique: [
      {
        id: 1,
        text: "Combien de fils au maximum a un nœud d'un arbre binaire ?",
        options: ['1', '2', '3', 'Illimité'],
        answer: 1,
        explanation: 'Un arbre binaire limite chaque nœud à deux fils.',
      },
      {
        id: 2,
        text: "Quelle est la complexité d'une recherche dichotomique ?",
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
        answer: 2,
        explanation: "On divise l'espace de recherche par deux à chaque étape.",
      },
      {
        id: 3,
        text: "Quel parcours visite d'abord la racine ?",
        options: ['Infixe', 'Suffixe', 'Préfixe', 'Aucun'],
        answer: 2,
        explanation: 'Le parcours préfixe visite la racine avant ses fils.',
      },
    ],
  };

  readonly subjects = Object.keys(this.bank);

  readonly history: QuizHistoryItem[] = [
    { title: 'Quiz SQL', subject: 'Bases de données', score: 16 },
    { title: 'Quiz Arbres', subject: 'Algorithmique', score: 14 },
  ];

  getQuestions(subject: string): Observable<Question[]> {
    return of((this.bank[subject] ?? []).map((q) => ({ ...q }))).pipe(delay(800));
  }
}
