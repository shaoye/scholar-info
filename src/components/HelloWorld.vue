<template>
  <div>
    <div class="navbar navbar-default navbar-static-top">
      <a class="navbar-brand" href="#">学者信息系统</a>
      <form class="navbar-form navbar-left">
        <div class="form-group">
          <input type="text" class="form-control" placeholder="Search">
        </div>
        <button type="submit" class="btn btn-default">Submit</button>
      </form>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-3">
          <div class="list-group">
            <button type="button"  class="list-group-item" v-for="teacher in teachers" @click="handleClick(teacher.name)">{{teacher.name}}</button>
          </div>
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li>
              <a href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo</span>
              </a>
            </li>
            <li><a href="#">1</a></li>
            <li><a href="#">2</a></li>
            <li><a href="#">3</a></li>
            <li><a href="#">4</a></li>
            <li><a href="#">5</a></li>
            <li>
              <a href="#" aria-label="Next">
                <span aria-hidden="true">&raquo</span>
              </a>
            </li>
          </ul>
        </nav>
        </div>
        <div class="col-md-9">
          <div class="panel panel-default">
            <div class="panel-heading">Force-Chart</div>
            <div class="panel-body">
              <div id="main"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import dataTool from 'echarts/extension/dataTool'
export default {
  name: 'HelloWorld',
  data () {
    return {
      teachers: []
      // teachers: [
      //   {id: 1, name: 'Richard Sutton'},
      //   {id: 2, name: 'lisi'},
      //   {id: 3, name: 'halowha'}
      // ]
    }
  },
  mounted () {
    this.axios.get('http://115.159.56.191/get_all_teachers').then((response) => {
      this.teachers = response.data
    })
  },
  methods: {
    handleClick (teacherName) {
      this.teacherName = teacherName
      this.mountedData()
    },
    mountedData () {
      var myChart = window.echarts.init(document.getElementById('main'))
      myChart.showLoading()
      var teacherName = this.teacherName
      $.post('http://115.159.56.191/get_relations_data', {'name': teacherName}).done(function (xml) {
        myChart.hideLoading()
        var graph = dataTool.gexf.parse(xml)
        var categories = []
        categories[0] = {'name': '本人'}
        categories[1] = {'name': teacherName + '的导师'}
        categories[2] = {'name': teacherName + '的学生'}
        categories[3] = {'name': teacherName + '的共同作者'}
        graph.nodes.forEach(function (node) {
          node.itemStyle = null
          // node.symbolSize = 10
          node.value = Math.floor((node.symbolSize - 10) * 1000)
          node.category = node.attributes[0]
          // Use random x, y
          node.x = node.y = null
          node.draggable = true
        })
        var option = {
          title: {
            text: 'Les Miserables',
            subtext: 'Default layout',
            top: 'bottom',
            left: 'right'
          },
          tooltip: {},
          legend: [{
            // selectedMode: 'single',
            data: categories.map(function (a) {
              return a.name
            })
          }],
          animation: false,
          series: [
            {
              type: 'graph',
              layout: 'force',
              data: graph.nodes,
              links: graph.links,
              categories: categories,
              roam: true,
              label: {
                normal: {
                  position: 'right'
                }
              },
              force: {
                repulsion: 100
              }
            }
          ]
        }
        myChart.setOption(option)
      }, 'xml')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  html, body, #main {
    width: 600px;
    height: 500px;
    margin: 0
  }
  .list-group-item {
    margin-bottom: 3px
  }
</style>
