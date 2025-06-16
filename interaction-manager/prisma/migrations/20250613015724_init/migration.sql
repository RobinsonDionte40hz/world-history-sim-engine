-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSimulated" TIMESTAMP(3),

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" INTEGER NOT NULL,
    "deathDate" INTEGER,
    "attributes" JSONB NOT NULL,
    "skills" JSONB NOT NULL,
    "personality" JSONB NOT NULL,
    "consciousness" JSONB,
    "currentLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "character1Id" TEXT NOT NULL,
    "character2Id" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "strength" DOUBLE PRECISION,
    "startedDate" INTEGER NOT NULL,
    "endedDate" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "features" JSONB NOT NULL,
    "resources" JSONB NOT NULL,
    "environmentalConditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "foundedDate" INTEGER NOT NULL,
    "dissolvedDate" INTEGER,
    "locationId" TEXT,
    "hierarchy" JSONB,
    "resources" JSONB,
    "metadata" JSONB,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalEvent" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT,
    "locationId" TEXT,
    "effects" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "eventId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "participantType" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("eventId","participantId")
);

-- CreateTable
CREATE TABLE "CharacterSnapshot" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "attributes" JSONB NOT NULL,
    "skills" JSONB NOT NULL,
    "locationId" TEXT,
    "inventory" JSONB,
    "goals" JSONB,
    "consciousnessState" JSONB,

    CONSTRAINT "CharacterSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestHistory" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "characterId" TEXT,
    "questId" TEXT NOT NULL,
    "startedDate" INTEGER NOT NULL,
    "completedDate" INTEGER,
    "outcome" TEXT,
    "rewards" JSONB,
    "metadata" JSONB,

    CONSTRAINT "QuestHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_templateId_key" ON "Template"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_characterId_key" ON "Character"("characterId");

-- CreateIndex
CREATE INDEX "idx_relationships_characters" ON "Relationship"("character1Id", "character2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Node_nodeId_key" ON "Node"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_groupId_key" ON "Group"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalEvent_eventId_key" ON "HistoricalEvent"("eventId");

-- CreateIndex
CREATE INDEX "idx_events_world_time" ON "HistoricalEvent"("worldId", "timestamp");

-- CreateIndex
CREATE INDEX "idx_events_type" ON "HistoricalEvent"("eventType");

-- CreateIndex
CREATE INDEX "idx_snapshots_character_time" ON "CharacterSnapshot"("characterId", "timestamp");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_character1Id_fkey" FOREIGN KEY ("character1Id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_character2Id_fkey" FOREIGN KEY ("character2Id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalEvent" ADD CONSTRAINT "HistoricalEvent_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalEvent" ADD CONSTRAINT "HistoricalEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "HistoricalEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSnapshot" ADD CONSTRAINT "CharacterSnapshot_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestHistory" ADD CONSTRAINT "QuestHistory_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestHistory" ADD CONSTRAINT "QuestHistory_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;
