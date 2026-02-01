-- CreateTable
CREATE TABLE "BlockchainLedger" (
    "id" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventName" TEXT,
    "eventPayload" TEXT,

    CONSTRAINT "BlockchainLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainLedger_txId_key" ON "BlockchainLedger"("txId");

-- CreateIndex
CREATE INDEX "BlockchainLedger_key_idx" ON "BlockchainLedger"("key");

-- CreateIndex
CREATE INDEX "BlockchainLedger_blockNumber_idx" ON "BlockchainLedger"("blockNumber");

-- CreateIndex
CREATE INDEX "BlockchainLedger_eventName_idx" ON "BlockchainLedger"("eventName");
