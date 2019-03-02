const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const json = require("koa-json");
const cors = require('koa2-cors');
const route = require('koa-route');
const tag = require('./tag/tag');
const BlogList = require('./Blog/blogList');
const classify = require('./classify/classify');
const personalInfo = require('./PersonalInfo/PersonalInfo')
const client = require('./Database/redis');
const md5 = require('./Login/md5')
const Login = require('./Login/Login');
const app = new Koa();
let blogList; // 新增博客
let updateblogitem; // 修改博客内容
let ListAllblog = [];// 所有博客
let DeleteBlogid; // 删除博客ID
let addtag; // 添加标签
let listtag; // 所有标签
let Deletetagid; // 删除标签ID
let listclassify; // 所有类别
let addclassify; // 添加的类别
let DeleteclassifyID; //删除类别ID
let Personalinfo; // 个人信息
let total = {}
let token = '';

// 跨域中间件
app.use(cors({
    origin: function(ctx) {
        if (ctx.url === '/test') {
        return false;
        }
        return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(bodyParser());
app.use(json());

// 路由,定义ctx.body
const insertblog = async ctx => {
    ctx.response.body = blogList;
};
const find = ctx => {
    //findAllBlog();
    ctx.response.body = ListAllblog
}
const update = ctx => {
    findAllBlog();
    ctx.response.body = updateblogitem
}
const Delete = ctx => {
    Deleteblog();
    findAllBlog();
    ctx.response.body = DeleteBlogid
}
const findTag = ctx => {
    findAllTag();
    ctx.response.body =  listtag;
}
const inserttag = ctx => {
    findAllTag();
}
const Deletetag = ctx => {
    findAllTag();
}
const findClassify = ctx => {
    findallClassify();
    ctx.response.body = listclassify
}
const insertclassify = ctx => {
    findallClassify();
}
const getPerosonalInfo = ctx => {
    ctx.response.body = Personalinfo
}
const personalnum = ctx => {
    ctx.response.body = total
}
const LoginInfo = ctx => {
    ctx.response.body = token
}
app.use(route.get('/PerosnalInfo',getPerosonalInfo));
app.use(route.get('/find',find));
app.use(route.get('/insert',insertblog));
app.use(route.get('/update',update));
app.use(route.get('/Delete',Delete));
app.use(route.get('/findTag',findTag));
app.use(route.get('/insertag',inserttag));
app.use(route.get('/DeleteTag',Deletetag));
app.use(route.get('/insertclassify',insertclassify));
app.use(route.get('/findClassify',findClassify));
app.use(route.get('/personalnum',personalnum))
app.use(route.get('/Login', LoginInfo))


// 解析请求主体
app.use(async ctx => {
  ctx.body = ctx.request.body;
  if(ctx.request.body.methods == 'Login'){   
    getToken(ctx.request.body.username,ctx.request.body.passwordname)
  } 
  if(ctx.request.body.methods == 'listblog') {          // 所有博客
    findAllBlog(parseInt(ctx.request.body.page), parseInt(ctx.request.body.pageSize))
  }
  if (ctx.request.body.methods == 'insert') {          // 发布博客
    blogList = ctx.request.body
    insert();

  } else if(ctx.request.body.methods == 'update') {    // 修改博客
      console.log("成功修改")
      updateblogitem = ctx.request.body
      updateblog();
  } else if(ctx.request.body.methods == 'Delete') {    // 删除博客
      console.log("成功删除")
      DeleteBlogid = ctx.request.body.id
      Deleteblog();
    
  } else if(ctx.request.body.methods == 'Taginsert') { // 标签增加
      console.log('标签增加')
      console.log(ctx.request.body)
      addtag = ctx.request.body
      insertTag();
  } else if(ctx.request.body.methods == 'DeleteTag') { // 标签删除
      console.log("标签删除")
      Deletetagid = ctx.request.body.tagid
      DeleteTag()
  } else if(ctx.request.body.methods == 'insertclassify') { // 分类添加
      console.log("添加类别")
      addclassify = ctx.request.body
      InsertClassify();
  } else if(ctx.request.body.methods == 'Deleteclassify') { // 分类删除
      console.log("删除分类")
      DeleteclassifyID = ctx.request.body.id
      DeleteClassify();
  } 
});
app.listen(3000, () => {});

// 添加博客到数据库
function insert() {
    let Blog = new BlogList({
          publishTime:blogList.publishTime,   // 博客发布时间
          watchnum:blogList.watchnum,       // 观看数
          blogtitle:blogList.blogtitle,     // 博客标题
          tagList:blogList.tagList,       // 标签组
          selectedkind:blogList.selectedkind,  // 类别
          briefcontent:blogList.briefcontent,  // 简要介绍
          blogcontent:blogList.blogcontent,    // 博客内容HTML形式
          markdowncontent:blogList.markdowncontent
    });
    Blog.save((err, res) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            /*console.log("Res:" + res);*/
            console.log('插入成功调用')
            findAllBlog();
            //UpdatePersonalInfo(total)
        }
    })
}

// 更新博客
function updateblog() {
    // 根据ID值进行查询
    let id = updateblogitem.id;
    let updatecontent = updateblogitem;
    BlogList.findByIdAndUpdate(id, updatecontent, (err,res) => {
        if(err) {
            console.log("Error: " + err);
        } else {
            console.log("更新成功")
            //console.log("Res:" + res);
            findAllBlog();
        }
    })
}

// 删除博客
function Deleteblog() {
    let id = DeleteBlogid;
    BlogList.findByIdAndRemove(id,(err, res) => {
        if (err) {
            console.log("Error:" + err);
        } else {
            console.log("删除成功")
            findAllBlog();
            //console.log("Res:" + res);
        }
    })
}


// 查询所有博客
function findAllBlog(page, size) {
    let start = ((page - 1)*size);     // 起始位置
    let end = (page*size) - 1              // 终止位置
    // if(start <= 0) {
    //     start = 0;
    // }
    BlogList.find((err, res) => {
        if (err) {
            console.log("Error:" + err);
        } else {
            console.log("查询到的博客:")
           let blog = res;
           total.blognum = res.length;
           console.log("总博客数为:" + total.blognum)
           ListAllblog = []
           // 筛选符合条件的博客
           blog.forEach((item, index) => {
                if(index >= start && index <= end) {
                    ListAllblog.push(item)
                }
           })
           UpdatePersonalInfo(total)
        }
    })
}

// 查询所有标签
function findAllTag() {
    tag.find((err, res) => {
        if(err) {
            console.log("Err" + err)
        } else {
          //  console.log('Res' + res)
            listtag = res
            total.tagnum = res.length
            console.log("总标签数为:" + total.tagnum)
            UpdatePersonalInfo(total)
        }
    })
}

// 插入标签
function insertTag() {
    let inserttag = new tag({
        tagname:addtag.tagname,
        color:addtag.color,
        backgroundColor:addtag.backgroundColor
    });
    inserttag.save((err, res) => {
        if (err) {
            console.log("Error is " + err)
        } else {
            console.log("成功插入标签")
          //  console.log("Res:" + res)
            findAllTag()
        }
    })
}
// 删除标签
function DeleteTag() {
    let id = Deletetagid;
    tag.findByIdAndRemove(id,(err,res) => {
        if(err) {
            console.log("Err:" + err)
        } else {
            console.log("删除标签成功")
            findAllTag()
        }
    })
}
// 添加类别
function InsertClassify() {
    let insert = new classify({
        name:addclassify.classifyname,
        color:addclassify.color,
        backgroundColor:addclassify.backgroundColor
    });
    insert.save((err, res) => {
        if(err) {
            console.log("Error" + err);
        } else {
           // console.log("Res:" + res);
            findallClassify();
        }
    })
}
// 所有类别
function findallClassify() {
    classify.find((err, res) => {
        if(err) {
            console.log("Error" + err)
        } else {
           // console.log("Res:" + res)
            listclassify = res;
            total.kindnum = res.length
            console.log("总分类数为:" + total.kindnum)
            //findallClassify();
            UpdatePersonalInfo(total)
        }
    })
}
// 删除分类
function DeleteClassify() {
    let id = DeleteclassifyID;
    classify.findByIdAndRemove(id,(err, res) => {
        if(err) {
            console.log("Error" + err)
        } else {
           // console.log("Res:" + res)
            findallClassify();
            UpdatePersonalInfo(total)
        }
    })
}
 
// 根据登录信息获取Token
function getToken(username, password) {
    let flag = false
    let wherestr = {
        'username':username,
        'password':password
    }
    Login.find(wherestr, (err, res) => {
        if (err) {
            console.log("Error " + err)
        } else {
            console.log("Res: " + res)
            for(var i in res) {
                flag = true
            }
            // 确认有此用户生成token(采用md5加密方式)
            if (flag == true) {
                console.log(md5(username,password))
                token = md5(username,password)
                client.set('token', token) // 存储到redis数据库
            } else {
                token = ''
            }
        }
    })
}


// 根据ID更新个人信息(博客发布数、分类、标签)
function UpdatePersonalInfo(updatestr) {
    let id = '5c5bf87cbce3b09234e9ef18'
    personalInfo.findByIdAndUpdate(id, updatestr, (err, res) => {
        if (err) {}
        else {
            console.log("Res:" + res)
          
        }
    })
    getpersonalinfo();
}

// 获得个人信息(博客发布数、分类、标签)
function getpersonalinfo() {
    personalInfo.find((err, res) => {
        if(err) {
            console.log("Error:" + err)
        } else {
            console.log("Res:" + res)
            Personalinfo = res
            console.log("获得个人信息:")
            console.log(Personalinfo)
        }
    })
}

findAllBlog(1,5);
findAllTag();
findallClassify();
getpersonalinfo();




