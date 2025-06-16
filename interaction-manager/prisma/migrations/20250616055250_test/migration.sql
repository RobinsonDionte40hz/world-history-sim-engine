/*
  Warnings:

  - You are about to drop the column `assets` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `attributeModifiers` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `charisma` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `constitution` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `dexterity` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `dynastyId` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `enemies` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `expenses` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `gold` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `income` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `influence` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `intelligence` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `lastSimulated` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `racialBonuses` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `skillBonuses` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `strength` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `supporters` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `temporaryModifiers` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `titles` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `wisdom` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `activeGoals` on the `CharacterSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `attributeModifiers` on the `CharacterSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `politicalPower` on the `CharacterSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `recentDecisions` on the `CharacterSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `relationships` on the `CharacterSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `wealth` on the `CharacterSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `influence` on the `EventParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `outcome` on the `EventParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `allies` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `enemies` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `influence` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `leader` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `members` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `HistoricalEvent` table. All the data in the column will be lost.
  - You are about to drop the column `significance` on the `HistoricalEvent` table. All the data in the column will be lost.
  - You are about to drop the column `defenses` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `population` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `ruler` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `wealth` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `autonomousGoalId` on the `QuestHistory` table. All the data in the column will be lost.
  - You are about to drop the column `decisionPoints` on the `QuestHistory` table. All the data in the column will be lost.
  - You are about to drop the column `compatibility` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `dependency` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `interactionCount` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `intimacy` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `lastInteraction` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `powerBalance` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `respect` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `subType` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `trust` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the `AutonomousGoal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DecisionHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Dynasty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FamilyRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Marriage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MarriageParticipant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `attributes` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AutonomousGoal" DROP CONSTRAINT "AutonomousGoal_characterId_fkey";

-- DropForeignKey
ALTER TABLE "AutonomousGoal" DROP CONSTRAINT "AutonomousGoal_worldId_fkey";

-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_dynastyId_fkey";

-- DropForeignKey
ALTER TABLE "DecisionHistory" DROP CONSTRAINT "DecisionHistory_characterId_fkey";

-- DropForeignKey
ALTER TABLE "DecisionHistory" DROP CONSTRAINT "DecisionHistory_worldId_fkey";

-- DropForeignKey
ALTER TABLE "Dynasty" DROP CONSTRAINT "Dynasty_worldId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyRelation" DROP CONSTRAINT "FamilyRelation_childId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyRelation" DROP CONSTRAINT "FamilyRelation_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Marriage" DROP CONSTRAINT "Marriage_dynastyId_fkey";

-- DropForeignKey
ALTER TABLE "Marriage" DROP CONSTRAINT "Marriage_worldId_fkey";

-- DropForeignKey
ALTER TABLE "_MarriageParticipant" DROP CONSTRAINT "_MarriageParticipant_A_fkey";

-- DropForeignKey
ALTER TABLE "_MarriageParticipant" DROP CONSTRAINT "_MarriageParticipant_B_fkey";

-- DropIndex
DROP INDEX "idx_character_dynasty";

-- DropIndex
DROP INDEX "idx_character_world_dynasty";

-- DropIndex
DROP INDEX "idx_events_significance";

-- DropIndex
DROP INDEX "idx_relationships_type";

-- DropIndex
DROP INDEX "idx_relationships_world_type";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "assets",
DROP COLUMN "attributeModifiers",
DROP COLUMN "charisma",
DROP COLUMN "constitution",
DROP COLUMN "dexterity",
DROP COLUMN "dynastyId",
DROP COLUMN "enemies",
DROP COLUMN "expenses",
DROP COLUMN "gold",
DROP COLUMN "income",
DROP COLUMN "influence",
DROP COLUMN "intelligence",
DROP COLUMN "lastSimulated",
DROP COLUMN "racialBonuses",
DROP COLUMN "skillBonuses",
DROP COLUMN "strength",
DROP COLUMN "supporters",
DROP COLUMN "temporaryModifiers",
DROP COLUMN "titles",
DROP COLUMN "wisdom",
ADD COLUMN     "attributes" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "CharacterSnapshot" DROP COLUMN "activeGoals",
DROP COLUMN "attributeModifiers",
DROP COLUMN "politicalPower",
DROP COLUMN "recentDecisions",
DROP COLUMN "relationships",
DROP COLUMN "wealth";

-- AlterTable
ALTER TABLE "EventParticipant" DROP COLUMN "influence",
DROP COLUMN "outcome";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "allies",
DROP COLUMN "enemies",
DROP COLUMN "influence",
DROP COLUMN "leader",
DROP COLUMN "members";

-- AlterTable
ALTER TABLE "HistoricalEvent" DROP COLUMN "scope",
DROP COLUMN "significance";

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "defenses",
DROP COLUMN "population",
DROP COLUMN "ruler",
DROP COLUMN "wealth";

-- AlterTable
ALTER TABLE "QuestHistory" DROP COLUMN "autonomousGoalId",
DROP COLUMN "decisionPoints";

-- AlterTable
ALTER TABLE "Relationship" DROP COLUMN "compatibility",
DROP COLUMN "dependency",
DROP COLUMN "interactionCount",
DROP COLUMN "intimacy",
DROP COLUMN "lastInteraction",
DROP COLUMN "powerBalance",
DROP COLUMN "respect",
DROP COLUMN "status",
DROP COLUMN "subType",
DROP COLUMN "trust";

-- DropTable
DROP TABLE "AutonomousGoal";

-- DropTable
DROP TABLE "DecisionHistory";

-- DropTable
DROP TABLE "Dynasty";

-- DropTable
DROP TABLE "FamilyRelation";

-- DropTable
DROP TABLE "Marriage";

-- DropTable
DROP TABLE "_MarriageParticipant";
