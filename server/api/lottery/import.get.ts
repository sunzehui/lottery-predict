// server/api/lottery/import.post.ts

import { defineEventHandler, H3Event } from 'h3';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import mysql from 'mysql2/promise';

// --- Database Configuration (Ideally from environment variables) ---
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'lottery', // Replace with your MySQL username
  password: process.env.DB_PASSWORD || 'lottery', // Replace with your MySQL password
  database: process.env.DB_DATABASE || 'lottery', // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

/**
 * 将原始 JSON 彩票数据转换为适合 lottery_results 表的格式。
 * @param {object} jsonData 原始彩票 JSON 对象。
 * @returns {object} 转换后的数据对象，键与数据库列名对应。
 */
function transformLotteryData(jsonData: any) {
  const transformed: any = {
    issue: jsonData.issue,
    date: jsonData.openTime, // Assuming openTime is already 'YYYY-MM-DD'
    prize_pool: Math.round(parseFloat(jsonData.prizePoolMoney) * 100), // Convert Yuan to Cents
    sales_amount: Math.round(parseFloat(jsonData.saleMoney) * 100),     // Convert Yuan to Cents
    // Initialize with defaults in case an award type is missing
    first_prize_winners: 0,
    first_prize_single_amount_cents: 0,
    second_prize_winners: 0,
    second_prize_single_amount_cents: 0,
    third_prize_winners: 0,
    third_prize_single_amount_cents: 0,
  };

  // Process red balls
  const redBalls = jsonData.frontWinningNum.split(' ').map((numStr: string) => parseInt(numStr, 10));
  redBalls.forEach((ball: number, index: number) => {
    if (index < 6) { // Ensure we only take 6 red balls
      transformed[`red_ball_${index + 1}`] = ball;
    }
  });

  // Process blue ball
  transformed.blue_ball = parseInt(jsonData.backWinningNum, 10);

  // Process winner details for 1st, 2nd, and 3rd prizes
  jsonData.winnerDetails.forEach((detail: any) => {
    switch (detail.awardEtc) {
      case '1': // First Prize
        transformed.first_prize_winners = parseInt(detail.baseBetWinner.awardNum, 10);
        transformed.first_prize_single_amount_cents = Math.round(parseFloat(detail.baseBetWinner.awardMoney) * 100);
        break;
      case '2': // Second Prize
        transformed.second_prize_winners = parseInt(detail.baseBetWinner.awardNum, 10);
        transformed.second_prize_single_amount_cents = Math.round(parseFloat(detail.baseBetWinner.awardMoney) * 100);
        break;
      case '3': // Third Prize
        transformed.third_prize_winners = parseInt(detail.baseBetWinner.awardNum, 10);
        transformed.third_prize_single_amount_cents = Math.round(parseFloat(detail.baseBetWinner.awardMoney) * 100);
        break;
      // Other awardEtc values are ignored as they are not in the table
    }
  });

  return transformed;
}

/**
 * 插入彩票结果到数据库。
 * @param {mysql.Connection} connection 数据库连接对象。
 * @param {object} dataToInsert 转换后的彩票数据对象。
 * @returns {Promise<number>} 插入的ID。
 */
async function insertLotteryResult(connection: mysql.Connection, dataToInsert: any): Promise<number> {
  const columns = Object.keys(dataToInsert).join(', ');
  const placeholders = Object.keys(dataToInsert).map(() => '?').join(', ');
  const values = Object.values(dataToInsert);

  const sql = `
        INSERT INTO lottery_results (${columns})
        VALUES (${placeholders})
    `;

  // The 'id', 'created_at', 'updated_at' columns are handled by the database
  // So, we don't include them in the INSERT statement.
  const [result]: any = await connection.execute(sql, values);
  return result.insertId;
}

export default defineEventHandler(async (event: H3Event) => {
  let connection: mysql.Connection | null = null;
  let lotteryJsonDataList: any[] = [];
  const importResults: { issue: string; status: string; id?: number; error?: string }[] = [];

  try {
    // Construct the path to data.json

    // `process.cwd()` gets the current working directory (project root)
    const jsonFilePath = join(process.cwd(), 'data.json'); // Or join(__dirname, 'data.json') if in server/api/lottery/
    console.log(`Attempting to read data from: ${jsonFilePath}`);

    // Read the JSON file
    const fileContent = await readFile(jsonFilePath, 'utf-8');
    lotteryJsonDataList = JSON.parse(fileContent);

    if (!Array.isArray(lotteryJsonDataList)) {
      throw new Error("JSON data is not an array. Expected a list of lottery objects.");
    }
    console.log(`JSON data list (${lotteryJsonDataList.length} items) read and parsed successfully.`);

    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully!');

    for (const lottoEntry of lotteryJsonDataList) {
      try {
        const transformedData = transformLotteryData(lottoEntry);

        // Filter `transformedData` to ensure only columns present in the table are inserted
        // `id`, `created_at`, `updated_at` are handled by the database
        const finalDataForInsert = {
          issue: transformedData.issue,
          date: transformedData.date,
          red_ball_1: transformedData.red_ball_1,
          red_ball_2: transformedData.red_ball_2,
          red_ball_3: transformedData.red_ball_3,
          red_ball_4: transformedData.red_ball_4,
          red_ball_5: transformedData.red_ball_5,
          red_ball_6: transformedData.red_ball_6,
          blue_ball: transformedData.blue_ball,
          prize_pool: transformedData.prize_pool,
          sales_amount: transformedData.sales_amount,
          first_prize_winners: transformedData.first_prize_winners,
          first_prize_single_amount_cents: transformedData.first_prize_single_amount_cents,
          second_prize_winners: transformedData.second_prize_winners,
          second_prize_single_amount_cents: transformedData.second_prize_single_amount_cents,
          third_prize_winners: transformedData.third_prize_winners,
          third_prize_single_amount_cents: transformedData.third_prize_single_amount_cents,
        };

        const insertId = await insertLotteryResult(connection, finalDataForInsert);
        importResults.push({
          issue: lottoEntry.issue,
          status: 'success',
          id: insertId
        });
        console.log(`Successfully inserted issue ${lottoEntry.issue} with ID: ${insertId}`);
      } catch (entryError: any) {
        console.error(`Error processing issue ${lottoEntry.issue}:`, entryError.message);
        importResults.push({
          issue: lottoEntry.issue,
          status: 'failed',
          error: entryError.message
        });
      }
    }

    return {
      statusCode: 200,
      message: `Batch import completed. Successfully imported ${importResults.filter(r => r.status === 'success').length} records.`,
      results: importResults
    };

  } catch (error: any) {
    console.error('Global error during lottery data import:', error);
    return {
      statusCode: 500,
      message: 'Failed to complete batch import of lottery data.',
      error: error.message,
      results: importResults // Still return partial results if some succeeded before global error
    };
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
});
