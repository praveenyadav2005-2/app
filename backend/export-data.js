/**
 * MongoDB Data Export Script
 * Exports Users and Games data to Excel files
 * 
 * Usage: node export-data.js
 * 
 * Make sure to set MONGODB_URI in your .env file or pass it as environment variable
 */

const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Import models
const User = require('./models/User');
const Game = require('./models/Game');

// MongoDB connection string - update this or use .env
const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_connection_string_here';

async function exportToExcel() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Create exports directory
    const exportDir = path.join(__dirname, 'exports');
    const fs = require('fs');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // =============== EXPORT USERS ===============
    console.log('📊 Fetching Users data...');
    const users = await User.find({}).lean();
    console.log(`   Found ${users.length} users`);

    const usersWorkbook = new ExcelJS.Workbook();
    usersWorkbook.creator = 'Enigma Export Script';
    usersWorkbook.created = new Date();

    const usersSheet = usersWorkbook.addWorksheet('Users', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    // Define columns for Users
    usersSheet.columns = [
      { header: 'ID', key: '_id', width: 28 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Game Completed', key: 'gameCompleted', width: 15 },
      { header: 'Game Completed At', key: 'gameCompletedAt', width: 22 },
      { header: 'Final Score', key: 'finalScore', width: 12 },
      { header: 'Portals Cleared', key: 'portalsCleared', width: 15 },
      { header: 'Time Survived (sec)', key: 'timeSurvived', width: 18 },
      { header: 'Created At', key: 'createdAt', width: 22 },
      { header: 'Updated At', key: 'updatedAt', width: 22 },
    ];

    // Style header row
    usersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    usersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    usersSheet.getRow(1).alignment = { horizontal: 'center' };

    // Add user data
    users.forEach(user => {
      usersSheet.addRow({
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        gameCompleted: user.gameCompleted ? 'Yes' : 'No',
        gameCompletedAt: user.gameCompletedAt ? new Date(user.gameCompletedAt).toLocaleString() : 'N/A',
        finalScore: user.finalScore || 0,
        portalsCleared: user.portalsCleared || 0,
        timeSurvived: user.timeSurvived || 0,
        createdAt: new Date(user.createdAt).toLocaleString(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A',
      });
    });

    // Add borders to all cells
    usersSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const usersFilePath = path.join(exportDir, `users_${timestamp}.xlsx`);
    await usersWorkbook.xlsx.writeFile(usersFilePath);
    console.log(`✅ Users data exported to: ${usersFilePath}\n`);

    // =============== EXPORT GAMES ===============
    console.log('🎮 Fetching Games data...');
    const games = await Game.find({}).lean();
    console.log(`   Found ${games.length} game records`);

    const gamesWorkbook = new ExcelJS.Workbook();
    gamesWorkbook.creator = 'Enigma Export Script';
    gamesWorkbook.created = new Date();

    const gamesSheet = gamesWorkbook.addWorksheet('Games', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    // Define columns for Games
    gamesSheet.columns = [
      { header: 'Game ID', key: '_id', width: 28 },
      { header: 'User ID', key: 'userId', width: 28 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Is Playing', key: 'isPlaying', width: 12 },
      { header: 'Is Completed', key: 'isCompleted', width: 12 },
      { header: 'Health', key: 'health', width: 10 },
      { header: 'Score', key: 'score', width: 12 },
      { header: 'Portals Cleared', key: 'portalsCleared', width: 15 },
      { header: 'Bonuses Cleared', key: 'bonusesCleared', width: 15 },
      { header: 'Obstacles Hit', key: 'obstaclesHit', width: 14 },
      { header: 'Difficulty', key: 'difficulty', width: 12 },
      { header: 'Current Speed', key: 'currentSpeed', width: 14 },
      { header: 'Global Time Left (sec)', key: 'globalTimeLeft', width: 20 },
      { header: 'Time Survived (sec)', key: 'timeSurvived', width: 18 },
      { header: 'Created At', key: 'createdAt', width: 22 },
      { header: 'Updated At', key: 'updatedAt', width: 22 },
    ];

    // Style header row
    gamesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    gamesSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    gamesSheet.getRow(1).alignment = { horizontal: 'center' };

    // Add game data
    games.forEach(game => {
      gamesSheet.addRow({
        _id: game._id.toString(),
        userId: game.userId ? game.userId.toString() : 'N/A',
        username: game.username,
        isPlaying: game.isPlaying ? 'Yes' : 'No',
        isCompleted: game.isCompleted ? 'Yes' : 'No',
        health: game.health,
        score: game.score || 0,
        portalsCleared: game.portalsCleared || 0,
        bonusesCleared: game.bonusesCleared || 0,
        obstaclesHit: game.obstaclesHit || 0,
        difficulty: game.difficulty,
        currentSpeed: game.currentSpeed,
        globalTimeLeft: game.globalTimeLeft,
        timeSurvived: game.timeSurvived || 0,
        createdAt: game.createdAt ? new Date(game.createdAt).toLocaleString() : 'N/A',
        updatedAt: game.updatedAt ? new Date(game.updatedAt).toLocaleString() : 'N/A',
      });
    });

    // Add borders to all cells
    gamesSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const gamesFilePath = path.join(exportDir, `games_${timestamp}.xlsx`);
    await gamesWorkbook.xlsx.writeFile(gamesFilePath);
    console.log(`✅ Games data exported to: ${gamesFilePath}\n`);

    // =============== SUMMARY REPORT ===============
    console.log('📈 Creating Summary Report...');
    
    const summaryWorkbook = new ExcelJS.Workbook();
    summaryWorkbook.creator = 'Enigma Export Script';
    summaryWorkbook.created = new Date();

    const summarySheet = summaryWorkbook.addWorksheet('Summary');

    // Calculate stats
    const completedGames = games.filter(g => g.isCompleted).length;
    const avgScore = games.length > 0 
      ? (games.reduce((sum, g) => sum + (g.score || 0), 0) / games.length).toFixed(2)
      : 0;
    const totalPortals = games.reduce((sum, g) => sum + (g.portalsCleared || 0), 0);
    const usersWhoCompleted = users.filter(u => u.gameCompleted).length;

    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 35 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    // Style header
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7030A0' }
    };

    const summaryData = [
      { metric: 'Export Date', value: new Date().toLocaleString() },
      { metric: 'Total Registered Users', value: users.length },
      { metric: 'Users Who Completed Game', value: usersWhoCompleted },
      { metric: 'Completion Rate (%)', value: users.length > 0 ? ((usersWhoCompleted / users.length) * 100).toFixed(2) + '%' : '0%' },
      { metric: 'Total Game Sessions', value: games.length },
      { metric: 'Completed Game Sessions', value: completedGames },
      { metric: 'Average Score', value: avgScore },
      { metric: 'Total Portals Cleared (All Games)', value: totalPortals },
      { metric: 'Highest Score', value: games.length > 0 ? Math.max(...games.map(g => g.score || 0)) : 0 },
    ];

    summaryData.forEach(row => summarySheet.addRow(row));

    // Add borders
    summarySheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const summaryFilePath = path.join(exportDir, `summary_${timestamp}.xlsx`);
    await summaryWorkbook.xlsx.writeFile(summaryFilePath);
    console.log(`✅ Summary exported to: ${summaryFilePath}\n`);

    console.log('═'.repeat(50));
    console.log('🎉 EXPORT COMPLETE!');
    console.log('═'.repeat(50));
    console.log(`📁 Files saved in: ${exportDir}`);
    console.log(`   - users_${timestamp}.xlsx`);
    console.log(`   - games_${timestamp}.xlsx`);
    console.log(`   - summary_${timestamp}.xlsx`);
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the export
exportToExcel();
