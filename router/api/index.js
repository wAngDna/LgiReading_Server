const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const async = require('async');
const router = express.Router();
const sqlUtil = require('../../util/sqlutil')
app.use(bodyParser.urlencoded({ extended: false })); //post请求设置
let BaseURL = 'http://www.xbiquge.la';

//获取首页小说推荐
router.get('/hotbook', async(req, res) => {
    let sql = 'select * from book_list order by rand() limit 10'
    let result = await sqlUtil.syncSqlConnect(sql, [])
    for (var item of result) {
        item.b_author = item.b_author.split('：')[1]
    }
    res.send(result)
});
router.get('/lookmore', async(req, res) => {
    let sql = 'select * from book_list order by rand() limit 1500,5'
    let result = await sqlUtil.syncSqlConnect(sql, [])
    for (var item of result) {
        item.b_author = item.b_author.split('：')[1]
    }
    res.send(result)
});
//分类数量
router.get('/classnum', async(req, res) => {
    let book_count = {}
    let sql = `select count(b_id) as man_count from book_list where b_type='玄幻小说' or b_type='修真小说' or b_type='科幻小说'`
    let result = await sqlUtil.syncSqlConnect(sql, [])
    book_count.man_count = result[0].man_count
    let sql2 = `select count(b_id) as woman_count from book_list where b_type='都市小说' or b_type='网游小说' or b_type='穿越小说'`
    let result2 = await sqlUtil.syncSqlConnect(sql2, [])
    book_count.woman_count = result2[0].woman_count
    res.send(book_count)
});
//书籍分类(1页20条)
router.get('/bookrank', async(req, res) => {
    let { type, page } = req.query
    if (!+page == 0) page = (+page - 1);
    let sqls = [
        `select * from book_list where b_type='玄幻小说' limit ?,20`,
        `select * from book_list where b_type='修真小说' limit ?,20`,
        `select * from book_list where b_type='科幻小说' limit ?,20`,
        `select * from book_list where b_type='都市小说' limit ?,20`,
        `select * from book_list where b_type='穿越小说' limit ?,20`,
        `select * from book_list where b_type='网游小说' limit ?,20`,
    ]
    if (type == 'xh') {
        let result = await sqlUtil.syncSqlConnect(sqls[0], [page * 20])
        for (var item of result) {
            item.b_author = item.b_author.split('：')[1]
        }
        res.send(result)
    } else if (type == 'wx') {
        let result = await sqlUtil.syncSqlConnect(sqls[1], [page * 20])
        for (var item of result) {
            item.b_author = item.b_author.split('：')[1]
        }
        res.send(result)
    } else if (type == 'kh') {
        let result = await sqlUtil.syncSqlConnect(sqls[2], [page * 20])
        for (var item of result) {
            item.b_author = item.b_author.split('：')[1]
        }
        res.send(result)
    } else if (type == 'yq') {
        let result = await sqlUtil.syncSqlConnect(sqls[3], [page * 20])
        for (var item of result) {
            item.b_author = item.b_author.split('：')[1]
        }
        res.send(result)
    } else if (type == 'cy') {
        let result = await sqlUtil.syncSqlConnect(sqls[4], [page * 20])
        for (var item of result) {
            item.b_author = item.b_author.split('：')[1]
        }
        res.send(result)
    } else if (type == 'wy') {
        let result = await sqlUtil.syncSqlConnect(sqls[5], [page * 20])
        for (var item of result) {
            item.b_author = item.b_author.split('：')[1]
        }
        res.send(result)
    }
});
//书籍推荐(1页15条)
router.get('/bookrecom', async(req, res) => {
    let { type, page } = req.query
    if (!+page == 0) page = (+page - 1);
    let sqls = [
        `select * from book_list where b_type='玄幻小说' or b_type='玄幻小说'  or  b_type='科幻小说' limit ?,15`,
        `select * from book_list where b_type='都市小说' or b_type='穿越小说'  or  b_type='网游小说' limit ?,15`,
    ]
    if (type == 'man') {
        let result = await sqlUtil.syncSqlConnect(sqls[0], [page * 15])
        for (var item of result) {
            item.b_author = item.b_author.split('：')[1]
        }
        result.sort(function() {
            return .5 - Math.random();
        });
        res.send(result)
    } else {
        let result = await sqlUtil.syncSqlConnect(sqls[1], [page * 15])
        for (var item of result) {
            item.b_author = item.b_author.split('：')[1]
        }
        result.sort(function() {
            return .5 - Math.random();
        });
        res.send(result)
    }
});
let getResults = async(index, type, page) => {
    let sqlArr = {
        hot_sql: [
            `select * from book_list where b_type='玄幻小说' limit ?,20`,
            `select * from book_list where b_type='修真小说' limit ?,20`,
            `select * from book_list where b_type='科幻小说' limit ?,20`,
            `select * from book_list where b_type='都市小说' limit ?,20`,
            `select * from book_list where b_type='穿越小说' limit ?,20`,
            `select * from book_list where b_type='网游小说' limit ?,20`,
        ],
        new_sql: [
            `select * from book_list where b_type='玄幻小说' order by b_id desc limit ?,20`,
            `select * from book_list where b_type='修真小说' order by b_id desc limit ?,20`,
            `select * from book_list where b_type='科幻小说' order by b_id desc limit ?,20`,
            `select * from book_list where b_type='都市小说' order by b_id desc limit ?,20`,
            `select * from book_list where b_type='穿越小说' order by b_id desc limit ?,20`,
            `select * from book_list where b_type='网游小说' order by b_id desc limit ?,20`,
        ]
    }
    if (type == 0) {
        let res = await sqlUtil.syncSqlConnect(sqlArr.hot_sql[index], [page * 20])
        for (var item of res) {
            item.b_author = item.b_author.split('：')[1]
        }
        res.sort(function() {
            return .5 - Math.random();
        });
        return res
    } else if (type == 1) {
        let res = await sqlUtil.syncSqlConnect(sqlArr.new_sql[index], [page * 20])
        for (var item of res) {
            item.b_author = item.b_author.split('：')[1]
        }
        res.sort(function() {
            return .5 - Math.random();
        });
        return res
    }
    return []
};
//分类详情(1页20条)
router.get('/classdetail', async(req, res) => {
    let { bclass, type, page, } = req.query;
    if (!+page == 0) page = (+page - 1);
    let indexArr = ['xh', 'wx', 'kh', 'yq', 'cy', 'wy'];
    let index = indexArr.findIndex((item) => {
        return item == bclass
    })
    let result = await getResults(index, +type, +page)
    res.send(result)
});
//根据书籍Url获取书籍目录
let getBookDir = (url) => {
    return new Promise((resolve, reject) => {
        try {
            request.get({ url: url, gzip: true, encoding: null }, (err, res) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    var body = iconv.decode(res.body, 'utf8');
                    var $ = cheerio.load(body, { decodeEntities: false });
                    let bookDirs = []
                    let book_dir = $('#wrapper .box_con').eq(1).find('#list dd');
                    book_dir.each(function() {
                        let item = $(this)
                        bookDirs.push({
                            dir_name: item.find('a').text(),
                            dir_url: 'http://www.xbiquge.la' + item.find('a').attr('href')
                        })
                    })
                    resolve(bookDirs)
                }
            });
        } catch (e) {
            reject(e)
        }
    })
};
//根据书籍获取目录
router.post('/bookdir', async(req, res) => {
    let { url } = req.body
    let bookDir = await getBookDir(url)
    let bookInfo = await getBookDetail(url)
    bookInfo.b_author = bookInfo.b_author.split('：')[1]
    bookInfo.b_lastUpd = bookInfo.b_lastUpd.split('：')[1]
    let book = {
        bookDir: bookDir,
        bookInfo: bookInfo
    }
    res.send(book)
});
let getChapter = (url) => {
    return new Promise((resolve, reject) => {
        try {
            request.get({ url: url, gzip: true, encoding: null }, (err, res) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    var body = iconv.decode(res.body, 'utf8');
                    var $ = cheerio.load(body, { decodeEntities: false });
                    let book_cont = $('.content_read .box_con #content').text();
                    resolve(book_cont)
                }
            });
        } catch (e) {
            reject(e)
        }
    })
};
//根据url获取书籍内容
router.get('/chapter', async(req, res) => {
    let { url } = req.query
    let book_cont = await getChapter(url);
    res.send(book_cont)
});
//根据书籍Url获取书籍详情
let getBookDetail = (url) => {
    return new Promise((resolve, reject) => {
        try {
            request.get({ url: url, gzip: true, encoding: null }, (err, res) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    var body = iconv.decode(res.body, 'utf8');
                    var $ = cheerio.load(body, { decodeEntities: false });
                    let book = $('#wrapper .box_con');
                    let book_dir = $('#wrapper .box_con').eq(1).find('#list dd');
                    let bookdetail = {
                        b_type: book.find('.con_top a').eq(2).text(),
                        b_url: url,
                        b_name: book.find('#maininfo #info h1').text(),
                        b_author: book.find('#maininfo #info p').eq(0).text(),
                        b_lastUpd: book.find('#maininfo #info p').eq(2).text(),
                        b_newChapter: {
                            newChapterText: book.find('#maininfo #info p').eq(3).find('a').text(),
                            newChapterUrl: book.find('#maininfo #info p').eq(3).find('a').attr('href'),
                        },
                        b_intr: book.find('#maininfo #intro p').eq(1).text(),
                        b_img: book.find('#sidebar #fmimg img').attr('src'),
                    }
                    resolve(bookdetail)
                }
            });
        } catch (e) {
            reject(e)
        }
    })
};

//获取大众观看推荐书籍
router.get('/recomlook', async(req, res) => {
    let sql = 'select * from book_list order by rand() limit 6'
    let result = await sqlUtil.syncSqlConnect(sql, [])
    res.send(result)
});
//模糊查询
router.post('/search', async(req, res) => {
    let { keyword } = req.body
    let sql = `select * from book_list where INSTR(b_name,?)>0 or INSTR(b_author,?)>0`
    let result = await sqlUtil.syncSqlConnect(sql, [keyword, keyword])
    for (var item of result) {
        item.b_author = item.b_author.split('：')[1]
    }
    res.send(result)
})




//书籍分类
router.get('/classbook', async(req, res) => {
    let { type } = req.query
    let books = await getAllBooks(type)
    var curCount = 0;
    var getDetail = async function(url, callback) {
        var delay = parseInt((Math.random() * 10000000) % 2000, 10);
        curCount++;
        console.log('现在的并发数是', curCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
        var detail = await getBookDetail(url)
        let sql = 'insert into book_list(b_type,b_name,b_author,b_intr,b_url,b_img,b_lastUpd,b_newChapterText,b_newChapterUrl) values(?,?,?,?,?,?,?,?,?)'
        let sqlArr = [detail.b_type, detail.b_name, detail.b_author, detail.b_intr, detail.b_url, detail.b_img, detail.b_lastUpd, detail.b_newChapter.newChapterText, detail.b_newChapter.newChapterUrl]
        let result = await sqlUtil.syncSqlConnect(sql, sqlArr)
        if (result.affectedRows == 1) {
            console.log(url + '写入成功')
        } else {
            console.log(url + '写入失败')
        }
        callback(null, url + 'ok');
    }
    async.mapLimit(books, 10, (url, callback) => {
        getDetail(url, callback)
    }, (err, result) => {
        console.log(result)
        console.log('分类小说抓取完成:');
    });
    res.send(books)
});
let getAllBooks = async(type) => {
    if (type == 'xh') {
        return await getClassBooks(0)
    } else if (type == 'wx') {
        return await getClassBooks(1)
    } else if (type == 'kh') {
        return await getClassBooks(5)
    } else if (type == 'yq') {
        return await getClassBooks(2)
    } else if (type == 'cy') {
        return await getClassBooks(3)
    } else if (type == 'wy') {
        return await getClassBooks(4)
    }
};
let getClassBooks = (typeCode) => {
    return new Promise((resolve, reject) => {
        try {
            request.get({ url: BaseURL + '/xiaoshuodaquan', gzip: true, encoding: null }, async(err, res) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    console.log('开始获取分类小说列表:');
                    let hotBooks = []
                    var body = iconv.decode(res.body, 'utf8');
                    var $ = cheerio.load(body, { decodeEntities: false });
                    let bookList = $('#wrapper #main .novellist').eq(typeCode).find('ul li');
                    bookList.each(function() {
                        let item = $(this)
                        let url = item.find('a').attr('href')
                        hotBooks.push(url)
                    });
                    resolve(hotBooks)
                    console.log('分类小说列表获取完成:');
                }
            });
        } catch (e) {
            reject(e)
        }
    })
};
module.exports = router;