const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
    res.send("📦 카드 API 동작 중!");
  });

router.post("/", async (req, res) => {
  const { card_front, card_back, tags } = req.body;

  if (!card_front || !card_back || !Array.isArray(tags)) {
    return res.status(400).send("필수 항목이 누락되었습니다.");
  }
  
  const insertCardSql = `INSERT INTO CARD (card_front, card_back) VALUES (?, ?)`;

  db.query(insertCardSql, [card_front, card_back], async (err, result) => {
    if (err) return res.status(500).send("카드 등록 실패");

    const card_id = result.insertId;

    const tagPromises = tags.map((tag) => {
        return new Promise((resolve, reject) => {
            db.query(`INSERT IGNORE INTO TAG (name) VALUES (?)`, [tag], (err1) => {
                if (err1) return reject(err1);

                db.query(`SELECT tag_id FROM TAG WHERE name = ?`, [tag], (err2, rows) => {
                    if (err2 || rows.length === 0) return reject(err2);

                    const tag_id = rows[0].tag_id;

                    db.query(`INSERT IGNORE INTO CARD_TAG (card_id, tag_id) VALUES (?, ?)`, [card_id, tag_id], (err3) => {
                        if (err3) return reject(err3);
                        resolve();
                    });
                });
            });
        });
    });

    try {
        await Promise.all(tagPromises);
        res.send("✅ 카드 등록 완료!");
    } catch (error) {
        console.error("❌ 전체 등록 중 오류:", error);
        res.status(500).send("카드 등록 중 오류 발생");
    }
  });
});

router.get("/list", (req, res) => {
    const tagFilter = req.query.tag;
  
    let sql = `
      SELECT C.card_id, C.card_front, C.card_back,
             GROUP_CONCAT(T.name) AS tags
      FROM CARD C
      LEFT JOIN CARD_TAG CT ON C.card_id = CT.card_id
      LEFT JOIN TAG T ON CT.tag_id = T.tag_id
      WHERE C.is_deleted = false
    `;
  
    const params = [];
    if (tagFilter) {
      sql += ` WHERE C.card_id IN (
        SELECT CT.card_id
        FROM CARD_TAG CT
        JOIN TAG T ON CT.tag_id = T.tag_id
        WHERE T.name = ?
      )`;
      params.push(tagFilter);
    }
  
    sql += " GROUP BY C.card_id ORDER BY C.created_at DESC";
  
    db.query(sql, params, (err, rows) => {
      if (err) {
        console.error("❌ 카드 조회 실패:", err);
        return res.status(500).send("조회 실패");
      }
  
      const formatted = rows.map((row) => ({
        card_id: row.card_id,
        card_front: row.card_front,
        card_back: row.card_back,
        tags: row.tags ? row.tags.split(",") : [],
      }));
  
      res.json(formatted);
    });
  });

  router.put("/delete", (req, res) => {
    const { card_ids } = req.body;
    if (!Array.isArray(card_ids) || card_ids.length === 0) {
      return res.status(400).send("삭제할 카드 ID가 필요합니다.");
    }

    const placeholders = card_ids.map(() => "?").join(",");
    const sql = `UPDATE CARD SET is_deleted = true WHERE card_id IN (${placeholders})`;

    db.query(sql, card_ids, (err) => {
      if (err) {
        console.error("❌ 카드 삭제 실패:", err);
        return res.status(500).send("카드 삭제 실패");
      }

      res.send("🗑️ 카드 삭제 완료");
    });
  });

  router.get("/trash", (req, res) => {
    const sql = `
      SELECT C.card_id, C.card_front, C.card_back,
             GROUP_CONCAT(T.name) AS tags
      FROM CARD C
      LEFT JOIN CARD_TAG CT ON C.card_id = CT.card_id
      LEFT JOIN TAG T ON CT.tag_id = T.tag_id
      WHERE C.is_deleted = true
      GROUP BY C.card_id
      ORDER BY C.created_at DESC
    `;
  
    db.query(sql, [], (err, rows) => {
      if (err) {
        console.error("❌ 삭제된 카드 조회 실패:", err);
        return res.status(500).send("휴지통 조회 실패");
      }
  
      const formatted = rows.map((row) => ({
        card_id: row.card_id,
        card_front: row.card_front,
        card_back: row.card_back,
        tags: row.tags ? row.tags.split(",") : [],
      }));
  
      res.json(formatted);
    });
  });

  router.put("/restore", (req, res) => {
    const { card_ids } = req.body;
    if (!Array.isArray(card_ids) || card_ids.length === 0) {
      return res.status(400).send("복원할 카드 ID가 필요합니다.");
    }
  
    const placeholders = card_ids.map(() => "?").join(",");
    const sql = `UPDATE CARD SET is_deleted = false WHERE card_id IN (${placeholders})`;
  
    db.query(sql, card_ids, (err) => {
      if (err) {
        console.error("❌ 복원 실패:", err);
        return res.status(500).send("복원 실패");
      }
  
      res.send("♻️ 복원 완료");
    });
  });
  
  router.get("/tags", (req, res) => {
    db.query(`SELECT name FROM TAG ORDER BY name`, (err, rows) => {
      if (err) {
        console.error("❌ 태그 목록 불러오기 실패:", err);
        return res.status(500).send("태그 불러오기 실패");
      }
  
      const tags = rows.map((row) => row.name);
      res.json(tags);
    });
  });

  router.post("/:card_id/memorized", (req, res) => {
    const cardId = req.params.card_id;
    const sql = `UPDATE CARD SET memorized_count = memorized_count + 1 WHERE card_id = ?`;

    db.query(sql, [cardId], (err, result) => {
      if (err) {
        console.error("✅ 암기 업데이트 실패:", err);
        return res.status(500).send("암기 실패");
      }
      res.send("✅ 암기 체크 완료");
    });
  });

  router.post("/:card_id/wrong", (req, res) => {
    const cardId = req.params.card_id;
    const sql = `UPDATE CARD SET wrong_count = wrong_count + 1 WHERE card_id = ?`;

    db.query(sql, [cardId], (err, result) => {
      if (err) {
        console.error("❌ 오답 업데이트 실패:", err);
        return res.status(500).send("오답 실패");
      }
      res.send("❌ 오답 체크 완료");
    });
  });

  router.put("/:card_id", async (req, res) => {
    const cardId = req.params.card_id;
    const { card_front, card_back } = req.body;
  
    if (!card_front || !card_back ) {
      return res.status(400).send("필수 항목 누락");
    }
  
    const updateSql = `UPDATE CARD SET card_front = ?, card_back = ? WHERE card_id = ?`;
  
    db.query(updateSql, [card_front, card_back, cardId], async (err1) => {
      if (err1) {
        console.error("❌ 카드 수정 실패:", err1);
        return res.status(500).send("카드 수정 실패");
      }
      res.send("✅ 카드 수정 완료");
    });
  });

  router.put("/:card_id/tags", (req, res) => {
    const cardId = req.params.card_id;
    const { tags } = req.body;
  
    if (!Array.isArray(tags)) {
      return res.status(400).send("태그 목록이 필요합니다.");
    }
  
    db.query(`DELETE FROM CARD_TAG WHERE card_id = ?`, [cardId], (err1) => {
      if (err1) {
        console.error("❌ 기존 태그 제거 실패:", err1);
        return res.status(500).send("기존 태그 제거 실패");
      }
  
      if (tags.length === 0) {
        return res.send("✅ 태그 제거 완료 (빈 목록)");
      }
  
      const tagInsertPromises = tags.map((tagName) => {
        return new Promise((resolve, reject) => {
          db.query(`SELECT tag_id FROM TAG WHERE name = ?`, [tagName], (err2, rows) => {
            if (err2 || rows.length === 0) {
              console.warn(`⚠️ 태그 '${tagName}'는 존재하지 않음, 무시됨`);
              return resolve(); 
            }
  
            const tagId = rows[0].tag_id;
  
            db.query(`INSERT INTO CARD_TAG (card_id, tag_id) VALUES (?, ?)`, [cardId, tagId], (err3) => {
              if (err3) return reject(err3);
              resolve();
            });
          });
        });
      });
  
      Promise.all(tagInsertPromises)
        .then(() => res.send("✅ 태그 수정 완료"))
        .catch((err) => {
          console.error("❌ 태그 연결 실패:", err);
          res.status(500).send("태그 연결 중 오류 발생");
        });
    });
  });

module.exports = router;
