const DATABASE_URL =
  'mysql://mymhs9fkqwqq7tioahmo:pscale_pw_OWU1NoTh2mNLEUbRd5g3OMErHxA0j4SbZPciTHVXSWW@us-east.connect.psdb.cloud/tgbotaccounting?ssl={"rejectUnauthorized":true}';

const mysql = require('mysql2');
const pool = mysql.createPool(DATABASE_URL);

let query = function (sql, params, callback) {
  pool.getConnection(function (errs, connection) {
    if (!connection) {
      callback && callback([]);
      return;
    }
    connection.query(sql, params, function (err, results, fields) {
      if (err) {
        console.log('err  ----->  ', err);
        console.log('数据操作失败');
      }
      callback && callback(results, fields);
    });
    connection.release();
  });
};

function handleSql(SQL, params = '') {
  return new Promise((resolve) => {
    query(SQL, params, (result) => {
      resolve(result);
    });
  });
}

//向外暴露方法
module.exports = handleSql;
