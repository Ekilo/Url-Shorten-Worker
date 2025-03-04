let res

let apiSrv = window.location.pathname
// let apiSrv = "https://pastebin.icdyct.cloudns.asia"
let password_value = document.querySelector("#passwordText").value
// let password_value = "tieludasiliqiuweiyue"

// 这是默认行为, 在不同的index.html中可以设置为不同的行为
let buildValueItemFunc = buildValueTxt

function shorturl() {
  if (document.querySelector("#longURL").value == "") {
    alert("Url cannot be empty!")
    return
  }

  document.getElementById("addBtn").disabled = true;
  document.getElementById("addBtn").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Please wait...';
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "add", url: document.querySelector("#longURL").value, key: document.querySelector("#keyPhrase").value, password: password_value })
  }).then(function (response) {
    return response.json();
  }).then(function (myJson) {
    res = myJson;
    document.getElementById("addBtn").disabled = false;
    document.getElementById("addBtn").innerHTML = 'Shorten it';

    // 成功生成短链 Succeed
    if (res.status == "200") {
      let keyPhrase = res.key;
      let valueLongURL = document.querySelector("#longURL").value;
      // save to localStorage
      localStorage.setItem(keyPhrase, valueLongURL);
      // add to urlList on the page
      addUrlToList(keyPhrase, valueLongURL)

      document.getElementById("result").innerHTML = window.location.protocol + "//" + window.location.host + "/" + res.key;
    } else {
      document.getElementById("result").innerHTML = res.error;
    }

    // 弹出消息窗口 Popup the result
    var modal = new bootstrap.Modal(document.getElementById('resultModal'));
    modal.show();

  }).catch(function (err) {
    alert("Unknow error. Please retry!");
    console.log(err);
    document.getElementById("addBtn").disabled = false;
    document.getElementById("addBtn").innerHTML = 'Shorten it';
  })
}

function copyurl(id, attr) {
  let target = null;

  if (attr) {
    target = document.createElement('div');
    target.id = 'tempTarget';
    target.style.opacity = '0';
    if (id) {
      let curNode = document.querySelector('#' + id);
      target.innerText = curNode[attr];
    } else {
      target.innerText = attr;
    }
    document.body.appendChild(target);
  } else {
    target = document.querySelector('#' + id);
  }

  try {
    let range = document.createRange();
    range.selectNode(target);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    console.log('Copy success')
  } catch (e) {
    console.log('Copy error')
  }

  if (attr) {
    // remove temp target
    target.parentElement.removeChild(target);
  }
}

function loadUrlList() {
  // 清空列表
  let urlList = document.querySelector("#urlList")
  while (urlList.firstChild) {
    urlList.removeChild(urlList.firstChild)
  }

  // 文本框中的长链接
  let longUrl = document.querySelector("#longURL").value
  console.log(longUrl)

  // 遍历localStorage
  let len = localStorage.length
  console.log(+len)
  for (; len > 0; len--) {
    let keyShortURL = localStorage.key(len - 1)
    let valueLongURL = localStorage.getItem(keyShortURL)

    // 如果长链接为空，加载所有的localStorage
    // If the long url textbox is empty, load all in localStorage
    // 如果长链接不为空，加载匹配的localStorage
    // If the long url textbox is not empty, only load matched item in localStorage
    if (longUrl == "" || (longUrl == valueLongURL)) {
      addUrlToList(keyShortURL, valueLongURL)
    }
  }
}

function addUrlToList(shortUrl, longUrl) {
  let urlList = document.querySelector("#urlList")

  let child = document.createElement('div')
  child.classList.add("mb-3")
  child.classList.add("list-group-item")

  let keyItem = document.createElement('div')
  keyItem.classList.add("input-group")

  // 删除按钮 Remove item button
  let delBtn = document.createElement('button')
  delBtn.setAttribute('type', 'button')
  delBtn.classList.add("btn", "btn-danger")
  delBtn.setAttribute('onclick', 'deleteShortUrl(\"' + shortUrl + '\")')
  delBtn.setAttribute('id', 'delBtn-' + shortUrl)
  delBtn.innerText = "X"
  keyItem.appendChild(delBtn)

  // 查询访问次数按钮 Query visit times button
  let qryCntBtn = document.createElement('button')
  qryCntBtn.setAttribute('type', 'button')
  qryCntBtn.classList.add("btn", "btn-info")
  qryCntBtn.setAttribute('onclick', 'queryVisitCount(\"' + shortUrl + '\")')
  qryCntBtn.setAttribute('id', 'qryCntBtn-' + shortUrl)
  qryCntBtn.innerText = "?"
  keyItem.appendChild(qryCntBtn)

  // 短链接信息 Short url
  let keyTxt = document.createElement('span')
  keyTxt.classList.add("key")
  keyTxt.classList.add("form-control")
  keyTxt.innerText = window.location.protocol + "//" + window.location.host + "/" + shortUrl
  keyItem.appendChild(keyTxt)
  
  child.appendChild(keyItem)

  // 长链接信息 Long url
  child.appendChild(buildValueItemFunc(longUrl))

  urlList.append(child)
}

function clearLocalStorage() {
  localStorage.clear()
}

function deleteShortUrl(delKeyPhrase) {
  // 按钮状态 Button Status
  document.getElementById("delBtn-" + delKeyPhrase).disabled = true;
  document.getElementById("delBtn-" + delKeyPhrase).innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

  // 从KV中删除 Remove item from KV
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "del", key: delKeyPhrase, password: password_value })
  }).then(function (response) {
    return response.json();
  }).then(function (myJson) {
    res = myJson;

    // 成功删除 Succeed
    if (res.status == "200") {
      // 从localStorage中删除
      localStorage.removeItem(delKeyPhrase)

      // 加载localStorage
      loadUrlList()

      document.getElementById("result").innerHTML = "Delete Successful"
    } else {
      document.getElementById("result").innerHTML = res.error;
    }

    // 弹出消息窗口 Popup the result
    var modal = new bootstrap.Modal(document.getElementById('resultModal'));
    modal.show();

  }).catch(function (err) {
    alert("Unknow error. Please retry!");
    console.log(err);
  })
}

function queryVisitCount(qryKeyPhrase) {
  // 按钮状态 Button Status
  document.getElementById("qryCntBtn-" + qryKeyPhrase).disabled = true;
  document.getElementById("qryCntBtn-" + qryKeyPhrase).innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

  // 从KV中查询 Query from KV
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "qry", key: qryKeyPhrase + "-count", password: password_value })
  }).then(function (response) {
    return response.json();
  }).then(function (myJson) {
    res = myJson;

    // 成功查询 Succeed
    if (res.status == "200") {
      document.getElementById("qryCntBtn-" + qryKeyPhrase).innerHTML = res.url;
    } else {
      document.getElementById("result").innerHTML = res.error;
      // 弹出消息窗口 Popup the result
      var modal = new bootstrap.Modal(document.getElementById('resultModal'));
      modal.show();
    }

  }).catch(function (err) {
    alert("Unknow error. Please retry!");
    console.log(err);
  })
}

function loadKV() {
  //清空本地存储
  clearLocalStorage(); 

  // 从KV中查询, cmd为 "qryall", 查询全部
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "qryall", password: password_value })
  }).then(function (response) {    
    return response.json();
  }).then(function (myJson) {
    res = myJson;
    // 成功查询 Succeed
    if (res.status == "200") {

      // 遍历kvlist
      res.kvlist.forEach(item => {      
        keyPhrase = item.key;
        valueLongURL = item.value;
        // save to localStorage
        localStorage.setItem(keyPhrase, valueLongURL);  
      });

    } else {
      document.getElementById("result").innerHTML = res.error;
      // 弹出消息窗口 Popup the result
      var modal = new bootstrap.Modal(document.getElementById('resultModal'));
      modal.show();
    }
  }).catch(function (err) {
    alert("Unknow error. Please retry!");
    console.log(err);
  })
}

function buildValueTxt(longUrl) {
  let valueTxt = document.createElement('div')
  valueTxt.classList.add("value")
  valueTxt.classList.add("form-control")
  valueTxt.innerText = longUrl
  return valueTxt
}

function buildValueImg(longUrl) {
  let valueImg = document.createElement('img')
  valueImg.classList.add("value")
  valueImg.classList.add("img-thumbnail")
  valueImg.src = longUrl
  return valueImg
}

function buildValueTxtarea(longUrl) {
  let valueDiv = document.createElement('div')
  valueDiv.classList.add("value")
  let valueTxt = document.createElement('textarea')
  valueTxt.classList.add("form-control")  
  valueTxt.innerText = longUrl
  valueDiv.appendChild(valueTxt)
  return valueDiv
}

document.addEventListener('DOMContentLoaded', function() {
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  });

  loadUrlList();
});