/*
  Warnings:

  - You are about to drop the column `attributes` on the `Character` table. All the data in the column will be lost.
  - Added the required column `attributeModifiers` to the `CharacterSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "attributes",
ADD COLUMN     "assets" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "attributeModifiers" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "charisma" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "constitution" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "dexterity" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "dynastyId" TEXT,
ADD COLUMN     "enemies" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "expenses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "income" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "influence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "intelligence" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "lastSimulated" TIMESTAMP(3),
ADD COLUMN     "racialBonuses" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "skillBonuses" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "strength" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "supporters" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "temporaryModifiers" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "titles" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "wisdom" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "CharacterSnapshot" ADD COLUMN     "activeGoals" JSONB,
ADD COLUMN     "attributeModifiers" JSONB NOT NULL,
ADD COLUMN     "politicalPower" DOUBLE PRECISION,
ADD COLUMN     "recentDecisions" JSONB,
ADD COLUMN     "relationships" JSONB,
ADD COLUMN     "wealth" INTEGER;

-- AlterTable
ALTER TABLE "EventParticipant" ADD COLUMN     "influence" DOUBLE PRECISION,
ADD COLUMN     "outcome" TEXT;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "allies" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "enemies" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "influence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "leader" TEXT,
ADD COLUMN     "members" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "HistoricalEvent" ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN     "significance" DOUBLE PRECISION NOT NULL DEFAULT 0.5;

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "defenses" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "population" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ruler" TEXT,
ADD COLUMN     "wealth" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "QuestHistory" ADD COLUMN     "autonomousGoalId" TEXT,
ADD COLUMN     "decisionPoints" JSONB;

-- AlterTable
ALTER TABLE "Relationship" ADD COLUMN     "compatibility" DOUBLE PRECISION,
ADD COLUMN     "dependency" DOUBLE PRECISION,
ADD COLUMN     "interactionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "intimacy" DOUBLE PRECISION,
ADD COLUMN     "lastInteraction" INTEGER,
ADD COLUMN     "powerBalance" DOUBLE PRECISION,
ADD COLUMN     "respect" DOUBLE PRECISION,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "subType" TEXT,
ADD COLUMN     "trust" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Dynasty" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "dynastyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "foundedDate" INTEGER NOT NULL,
    "dissolvedDate" INTEGER,
    "founder" TEXT,
    "wealth" INTEGER NOT NULL DEFAULT 0,
    "power" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reputation" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "territories" JSONB NOT NULL DEFAULT '[]',
    "allies" JSONB NOT NULL DEFAULT '[]',
    "rivals" JSONB NOT NULL DEFAULT '[]',
    "achievements" JSONB NOT NULL DEFAULT '[]',
    "events" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dynasty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marriage" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "marriageId" TEXT NOT NULL,
    "startDate" INTEGER NOT NULL,
    "endDate" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "dowry" JSONB,
    "politicalAlliance" BOOLEAN NOT NULL DEFAULT false,
    "dynastyId" TEXT,
    "children" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Marriage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyRelation" (
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "legitimacy" BOOLEAN NOT NULL DEFAULT true,
    "inheritanceRights" JSONB NOT NULL DEFAULT '{}',
    "successionOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyRelation_pkey" PRIMARY KEY ("parentId","childId")
);

-- CreateTable
CREATE TABLE "AutonomousGoal" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "startedAt" INTEGER NOT NULL,
    "targetDate" INTEGER,
    "completedAt" INTEGER,
    "questId" TEXT,
    "questNodeId" TEXT,
    "personalityFit" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "attributeFit" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "contextFit" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutonomousGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionHistory" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "situation" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "chosenOption" JSONB NOT NULL,
    "attributeInfluence" JSONB NOT NULL,
    "personalityInfluence" JSONB NOT NULL,
    "goalInfluence" JSONB NOT NULL,
    "relationshipInfluence" JSONB NOT NULL,
    "expectedOutcome" JSONB,
    "actualOutcome" JSONB,
    "satisfaction" DOUBLE PRECISION,
    "questContext" TEXT,
    "locationContext" TEXT,
    "socialContext" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MarriageParticipant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MarriageParticipant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dynasty_dynastyId_key" ON "Dynasty"("dynastyId");

-- CreateIndex
CREATE INDEX "idx_dynasty_world" ON "Dynasty"("worldId");

-- CreateIndex
CREATE UNIQUE INDEX "Marriage_marriageId_key" ON "Marriage"("marriageId");

-- CreateIndex
CREATE INDEX "idx_marriage_world" ON "Marriage"("worldId");

-- CreateIndex
CREATE INDEX "idx_marriage_dynasty" ON "Marriage"("dynastyId");

-- CreateIndex
CREATE INDEX "idx_family_parent" ON "FamilyRelation"("parentId");

-- CreateIndex
CREATE INDEX "idx_family_child" ON "FamilyRelation"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "AutonomousGoal_goalId_key" ON "AutonomousGoal"("goalId");

-- CreateIndex
CREATE INDEX "idx_goal_character_status" ON "AutonomousGoal"("characterId", "status");

-- CreateIndex
CREATE INDEX "idx_goal_world_type" ON "AutonomousGoal"("worldId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionHistory_decisionId_key" ON "DecisionHistory"("decisionId");

-- CreateIndex
CREATE INDEX "idx_decision_character_time" ON "DecisionHistory"("characterId", "timestamp");

-- CreateIndex
CREATE INDEX "idx_decision_world_time" ON "DecisionHistory"("worldId", "timestamp");

-- CreateIndex
CREATE INDEX "_MarriageParticipant_B_index" ON "_MarriageParticipant"("B");

-- CreateIndex
CREATE INDEX "idx_character_dynasty" ON "Character"("dynastyId");

-- CreateIndex
CREATE INDEX "idx_character_world_dynasty" ON "Character"("worldId", "dynastyId");

-- CreateIndex
CREATE INDEX "idx_events_significance" ON "HistoricalEvent"("significance");

-- CreateIndex
CREATE INDEX "idx_relationships_type" ON "Relationship"("relationshipType");

-- CreateIndex
CREATE INDEX "idx_relationships_world_type" ON "Relationship"("worldId", "relationshipType");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "Dynasty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dynasty" ADD CONSTRAINT "Dynasty_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "Dynasty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyRelation" ADD CONSTRAINT "FamilyRelation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyRelation" ADD CONSTRAINT "FamilyRelation_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutonomousGoal" ADD CONSTRAINT "AutonomousGoal_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutonomousGoal" ADD CONSTRAINT "AutonomousGoal_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionHistory" ADD CONSTRAINT "DecisionHistory_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionHistory" ADD CONSTRAINT "DecisionHistory_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarriageParticipant" ADD CONSTRAINT "_MarriageParticipant_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarriageParticipant" ADD CONSTRAINT "_MarriageParticipant_B_fkey" FOREIGN KEY ("B") REFERENCES "Marriage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
