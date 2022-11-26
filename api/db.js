const DATABASE_URL =
  'mysql://tmwqi6nkqzow0snhjm2c:pscale_pw_IDPmLMVh52nyTgAAXREyXqWgjhe9XjAhzZaG47w0jjr@us-east.connect.psdb.cloud/accountingbot?ssl={"rejectUnauthorized":true}';

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
