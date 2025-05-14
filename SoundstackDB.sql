DROP DATABASE IF EXISTS SoundstackDB;
CREATE DATABASE SoundstackDB;
USE SoundstackDB;

CREATE TABLE Users (
    `UserID` int NOT NULL AUTO_INCREMENT,
    `Username` varchar(30) NOT NULL UNIQUE,
    `Password` varchar(100) NOT NULL,
    `CreationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID)
);

CREATE TABLE User_Login (
    `LoginID` int NOT NULL AUTO_INCREMENT,
    `UserID` int NOT NULL,
    `LoginTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `LoginSuccess` boolean NOT NULL,
    PRIMARY KEY (LoginID),
    FOREIGN KEY (UserID) REFERENCES Users (UserID) ON DELETE CASCADE
);

CREATE TABLE Playlists (
  `PlaylistID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Name` varchar(50) NOT NULL,
  `Tags` TEXT,
  `Pinned` BOOLEAN DEFAULT 0,
  `DateCreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PlaylistID`),
  FOREIGN KEY (`UserID`) REFERENCES Users(`UserID`) ON DELETE CASCADE
);

CREATE TABLE Tracks (
  `TrackID` int NOT NULL AUTO_INCREMENT,
  `DeezerID` varchar(30),
  `Title` varchar(100),
  `Artist` varchar(100),
  `Album` varchar(100),
  `Duration` int,
  `AlbumCover` varchar(1024),
  `PreviewURL` varchar(1024),
  PRIMARY KEY (`TrackID`)
);

CREATE TABLE PlaylistTracks (
  `PlaylistID` int NOT NULL,
  `TrackID` int NOT NULL,
  `DateAdded` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PlaylistID`, `TrackID`),
  FOREIGN KEY (`PlaylistID`) REFERENCES Playlists(`PlaylistID`) ON DELETE CASCADE,
  FOREIGN KEY (`TrackID`) REFERENCES Tracks(`TrackID`) ON DELETE CASCADE
);

CREATE TABLE Tags (
  `TagID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(30) NOT NULL UNIQUE,
  PRIMARY KEY (`TagID`)
);

CREATE TABLE PlaylistTags (
  `PlaylistID` int NOT NULL,
  `TagID` int NOT NULL,
  PRIMARY KEY (`PlaylistID`, `TagID`),
  FOREIGN KEY (`PlaylistID`) REFERENCES Playlists(`PlaylistID`) ON DELETE CASCADE,
  FOREIGN KEY (`TagID`) REFERENCES Tags(`TagID`) ON DELETE CASCADE
);
