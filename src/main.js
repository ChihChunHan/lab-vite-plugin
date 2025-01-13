function get() {
  return this.$http({
    method: FOLLOW_COMPANY_API.getNotifySetting.method,
    url: `${FOLLOW_COMPANY_API.getNotifySetting.endpoint}`,
    $defineStub: {
      status: 200,
      data: {
        data: {
          emailNotify: 1,
          jobNotify: "1",
          newsNotify: ["string"],
          h: 1
        },
        metadata: {}
      }
    },
    $defineStub: {
      status: 200,
      data: {
        data: {
          emailNotify: 1,
          jobNotify: "1",
          newsNotify: ["string"],
          h: 1
        },
        metadata: {}
      }
    },
    // foo: {
    //   "bar": "baz"
    // },
    // $defineStub: foo
  }).then((res) => {
    data.value = res.data.data;
    metadata.value = res.data.metadata;
    return res;
  });
}

function post() {
  return this.$http({
    method: FOLLOW_COMPANY_API.getNotifySetting.method,
    url: `${FOLLOW_COMPANY_API.getNotifySetting.endpoint}`,
    $defineStub: {
      status: 200,
      data: {
        data: {
          emailNotify: 1,
          jobNotify: "1",
          newsNotify: ["string"],
          h: 1
        },
        metadata: {}
      }
    },
    // foo: {
    //   "bar": "baz"
    // },
    // $defineStub: ((foo) => ({a:foo}))({b:1}),
  }).then((res) => {
    data.value = res.data.data;
    metadata.value = res.data.metadata;
    return res;
  });
}


console.log(get());
console.log(post());
