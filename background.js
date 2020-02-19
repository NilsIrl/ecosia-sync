function getSearchCountFromCookie(values, index) {
  return parseInt(values[index].slice(2));
}

function getCountIndex(values) {
  for (let i in values) {
    if (values[i].startsWith("t=")) {
      return i;
    }
  }
}

function setSyncCount(cookie_count) {
  browser.storage.sync.get({search_count: 0}).then(function(storage) {
    if (cookie_count > storage.search_count) {
      browser.storage.sync.set({search_count: cookie_count});
    }
  });
}

browser.cookies.get({
  url: "https://www.ecosia.org",
  name: "ECFG"
}).then(function(cookie) {
  if (cookie !== null) {
    const values = cookie.value.split(":");
    setSyncCount(getSearchCountFromCookie(values, getCountIndex(values)));
  }
});

browser.cookies.onChanged.addListener(function(changeInfo) {
  if (changeInfo.cookie.name === "ECFG" && !changeInfo.removed && changeInfo.cause === "explicit") {
    const values = changeInfo.cookie.value.split(":");
    const index = getCountIndex(values);
    const count = getSearchCountFromCookie(values, index);
    if (count === 0) {
      browser.storage.sync.get({search_count: 0}).then(function(storage) {
        values[index] = `t=${storage.search_count}`;
        browser.cookies.set({
          url: "https://www.ecosia.org/",
          domain: changeInfo.cookie.domain,
          name: "ECFG",
          value: values.join(":")
        });
      });
    } else {
      setSyncCount(count);
    }
  }
});
