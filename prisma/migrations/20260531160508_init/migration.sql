-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT,
    "displayName" TEXT NOT NULL,
    "profileImage" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'receiver',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReceiverProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "publicSlug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'AR',
    "profileImage" TEXT,
    "qrCodeUrl" TEXT,
    "publicUrl" TEXT NOT NULL,
    "suggestedAmounts" TEXT NOT NULL DEFAULT '[500,1000,2000,5000]',
    "allowCustom" BOOLEAN NOT NULL DEFAULT true,
    "minAmount" INTEGER NOT NULL DEFAULT 100,
    "maxAmount" INTEGER NOT NULL DEFAULT 100000,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReceiverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiverProfileId" TEXT NOT NULL,
    "senderUserId" TEXT,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentProvider" TEXT NOT NULL DEFAULT 'mock',
    "paymentProviderId" TEXT,
    "paymentPreferenceId" TEXT,
    "paymentUrl" TEXT,
    "failureReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tip_receiverProfileId_fkey" FOREIGN KEY ("receiverProfileId") REFERENCES "ReceiverProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tip_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiverProfile_userId_key" ON "ReceiverProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiverProfile_publicSlug_key" ON "ReceiverProfile"("publicSlug");
