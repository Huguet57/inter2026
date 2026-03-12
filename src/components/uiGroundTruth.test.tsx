import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { groupMatches, knockoutMatches, Match, KnockoutMatches } from '../data/tournament';
import { GroupStage } from './GroupStage';
import { KnockoutStage } from './KnockoutStage';
import { MatchSchedule } from './MatchSchedule';

const { useMatchesMock } = vi.hoisted(() => ({
  useMatchesMock: vi.fn(),
}));

vi.mock('../context/useMatches', () => ({
  useMatches: useMatchesMock,
}));

interface ScheduleEntry {
  id: string;
  time: string;
  field: number;
  phase: string;
  match?: string;
  description?: string;
  participants?: string;
}

interface KnockoutEntry {
  id: string;
  time: string;
  field: number;
  description: string;
  participants: string;
}

interface GroundTruth {
  groups: Record<string, string[]>;
  schedule: ScheduleEntry[];
  knockout: Record<string, KnockoutEntry[]>;
}

const cloneMatches = (matches: Match[]): Match[] => matches.map((match) => ({ ...match }));

const cloneKnockoutMatches = (matches: KnockoutMatches): KnockoutMatches => ({
  roundOf16: cloneMatches(matches.roundOf16),
  quarterFinals: cloneMatches(matches.quarterFinals),
  semiFinals: cloneMatches(matches.semiFinals),
  thirdPlace: { ...matches.thirdPlace },
  final: { ...matches.final },
});

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseJsonSection = <T,>(content: string, title: string): T => {
  const pattern = new RegExp(`## ${escapeRegExp(title)}\\n\\n\`\`\`json\\n([\\s\\S]*?)\\n\`\`\``);
  const match = content.match(pattern);

  if (!match) {
    throw new Error(`Missing "${title}" section in GROUND-TRUTH-2026.md`);
  }

  return JSON.parse(match[1]) as T;
};

const loadGroundTruth = (): GroundTruth => {
  const groundTruthPath = fileURLToPath(new URL('../../GROUND-TRUTH-2026.md', import.meta.url));
  const content = readFileSync(groundTruthPath, 'utf8');

  return {
    groups: parseJsonSection<GroundTruth['groups']>(content, 'Groups'),
    schedule: parseJsonSection<GroundTruth['schedule']>(content, 'Schedule'),
    knockout: parseJsonSection<GroundTruth['knockout']>(content, 'Knockout'),
  };
};

const normalizeText = (value: string): string =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const renderText = (element: ReactElement): string => normalizeText(renderToStaticMarkup(element));

const extractGroupSection = (markup: string, groupNumber: string): string => {
  const startLabel = `GRUP ${groupNumber}`;
  const nextLabel = `GRUP ${Number(groupNumber) + 1}`;
  const startIndex = markup.indexOf(startLabel);

  if (startIndex === -1) {
    throw new Error(`Missing group header ${startLabel}`);
  }

  const nextIndex = markup.indexOf(nextLabel, startIndex + startLabel.length);
  const section = markup.slice(startIndex, nextIndex === -1 ? markup.length : nextIndex);

  return normalizeText(section);
};

const buildMatchContext = () => ({
  matches: cloneMatches(groupMatches),
  knockoutMatches: cloneKnockoutMatches(knockoutMatches),
  updateMatch: vi.fn(),
  updateKnockoutMatch: vi.fn(),
  loading: false,
});

describe('UI ground truth', () => {
  const groundTruth = loadGroundTruth();

  beforeEach(() => {
    useMatchesMock.mockReturnValue(buildMatchContext());
  });

  it('renders every team in the correct group table with zeroed initial standings', () => {
    const markup = renderToStaticMarkup(<GroupStage />);

    expect(Object.keys(groundTruth.groups)).toHaveLength(7);

    for (const [groupNumber, teams] of Object.entries(groundTruth.groups)) {
      const groupSection = extractGroupSection(markup, groupNumber);

      expect(groupSection).toContain(`GRUP ${groupNumber}`);

      for (const team of teams) {
        expect(groupSection).toContain(`${team} 0 0 0 0 0 0 0`);
      }
    }
  });

  it('renders the schedule rows defined in GROUND-TRUTH-2026.md', () => {
    const pageText = renderText(<MatchSchedule />);

    expect(groundTruth.schedule).toHaveLength(56);
    expect(pageText).toContain(
      "Els equips mostrats a sota són una estimació basada en la classificació actual dels grups",
    );

    for (const entry of groundTruth.schedule) {
      const fragments = [
        entry.time,
        `Pista ${entry.field}`,
        entry.match ?? '',
        entry.description ?? '',
        entry.participants ?? '',
        entry.phase,
        'Per jugar',
      ].filter(Boolean);

      expect(pageText).toContain(normalizeText(fragments.join(' ')));
    }
  });

  it('renders the knockout cards and phases from the ground truth file', () => {
    const pageText = renderText(<KnockoutStage />);

    expect(pageText).toContain(
      'Els equips mostrats són una estimació basada en la classificació actual dels grups',
    );

    for (const [phase, matches] of Object.entries(groundTruth.knockout)) {
      expect(pageText).toContain(phase);

      for (const match of matches) {
        const fragments = [
          match.time,
          `Pista ${match.field}`,
          match.description,
          match.participants,
          'Per jugar',
        ];

        expect(pageText).toContain(normalizeText(fragments.join(' ')));
      }
    }
  });
});
