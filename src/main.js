

function get() {
  return this.$http({
    method: FOLLOW_COMPANY_API.getNotifySetting.method,
    url: `${FOLLOW_COMPANY_API.getNotifySetting.endpoint}`,
    $defineStub: {
      status: 200,
      data: {
        data: {
          emailNotify: 1,
          jobNotify: 1
        },
        metadata: {}
      }
    },
    foo: {
      bar: {
        baz: 1
      }
    },
    $defineStub: ()=>{},
    $defineStub(){},
    $defineStub:function (){}
  }).then((res) => {
    data.value = res.data.data;
    metadata.value = res.data.metadata;
    return res;
  });
}


console.log(get());
