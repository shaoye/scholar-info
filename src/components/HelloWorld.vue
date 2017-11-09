<template>
  <div>
    <div class="navbar navbar-default navbar-static-top navbar-inverse">
      <a class="navbar-brand" href="#">学者信息系统</a>
      <form class="navbar-form navbar-left">
        <div class="form-group">
          <input type="text" class="form-control" placeholder="Search">
        </div>
        <button type="submit" class="btn btn-default">Submit</button>
      </form>
      <button type="button" class="btn btn-default navbar-btn"
        @click="mapClick()"
      >
        Map
      </button>
      <button type="button" class="btn btn-default navbar-btn"
        @click="allClick()"
      >
        All
      </button>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-2">
          <div class="list-group">
            <paginate
              name="teach"
              :list="teachers"
              :per="15"
            >
                <button type="button" class="list-group-item" 
                  v-for="teacher in paginated('teach')"
                  @click="handleClick(teacher.name)"
                >
                  {{ teacher.name }}
                </button>   
            </paginate>
          </div>
          <nav class="pages"aria-label="Page navigation">
              <paginate-links 
                for="teach"
                  :simple="{
                    prev: 'Back',
                    next: 'Next'
                  }"
                  :classes="{
                    'ul': 'pager'
                  }"
              ></paginate-links>
          </nav>
        </div>
        
        <div class="col-md-10">
          <div class="panel panel-default">
            <div class="panel-heading" v-bind:title="title">{{ title }}</div>
            <div class="col-md-3">
              <div class="panel-body">
                <div v-if="teachInfos.name">              
                  <div class="panel-body" id="panelbody" v-for="(value, key) in teachInfos">
                    <h3>{{ key }}:</h3> {{ value }}
                  </div>
                </div>
                <div v-else>
                  <paginate
                    name="school"
                    :list="university"
                    :per="13"
                  >
                    <ul class="list-group">
                      <li class="list-group-item" v-for="value in paginated('school')">
                        <span class="badge">{{ value.value }}</span>
                        {{ value.name }}
                      </li>
                    </ul>
                  </paginate>
                  <nav class="pages"aria-label="Page navigation">
                    <paginate-links 
                      for="school"
                        :simple="{
                          prev: 'Back',
                          next: 'Next'
                        }"
                        :classes="{
                          'ul': 'pager'
                        }"
                    ></paginate-links>
                </nav>
                </div>
              </div>
            </div>
            <div class="col-md-9">
              <div class="panel-body">
                <div id="main"></div>
              </div>
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
import 'echarts/map/js/world.js'
export default {
  name: 'HelloWorld',
  data () {
    return {
      title: '强化学习方向学者关系图 | CIRCULAR',
      teachers: [],
      paginate: ['teach', 'school'],
      teachInfos: [],
      university: []
    }
  },
  mounted () {
    this.axios.get('http://115.159.56.191/get_all_teachers').then((response) => {
      this.teachers = response.data
    })
    this.axios.get('http://115.159.56.191/map_data_bachelor').then((response) => {
      var data = response.data
      this.university = data['mapData']
    })
    // this.mountedAllData()
    this.mountedArea()
  },
  methods: {
    handleClick (teacherName) {
      this.teacherName = teacherName
      this.title = teacherName + '的关系网络图 | FORCE'
      this.mountedTeachInfos(teacherName)
      this.mountedData()
    },
    mapClick () {
      this.mountedArea()
    },
    allClick () {
      this.mountedAllData()
    },
    mountedData () {
      window.echarts.dispose(document.getElementById('main'))
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
                repulsion: 1000,
                edgeLength: [10, 200]
              }
            }
          ]
        }
        myChart.setOption(option)
      }, 'xml')
    },
    mountedAllData () {
      window.echarts.dispose(document.getElementById('main'))
      var myChart = window.echarts.init(document.getElementById('main'))
      myChart.showLoading()
      $.get('http://115.159.56.191/index_graph', function (xml) {
        myChart.hideLoading()
        var graph = dataTool.gexf.parse(xml)
        var categories = []
        for (var i = 0; i < 9; i++) {
          categories[i] = {
            name: '类目' + i
          }
        }
        graph.nodes.forEach(function (node) {
          node.itemStyle = null
          node.symbolSize /= 1.5
          node.value = node.symbolSize
          node.label = {
            normal: {
              show: node.symbolSize > 10
            }
          }
          node.category = node.attributes.modularity_class
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
          animationDurationUpdate: 1500,
          animationEasingUpdate: 'quinticInOut',
          series: [
            {
              name: 'Les Miserables',
              type: 'graph',
              layout: 'circular',
              circular: {
                rotateLabel: true
              },
              data: graph.nodes,
              links: graph.links,
              categories: categories,
              roam: true,
              label: {
                normal: {
                  position: 'right',
                  formatter: '{b}'
                }
              },
              focusNodeAdjacency: true,
              lineStyle: {
                normal: {
                  color: 'source',
                  curveness: 0.3
                }
              }
            }
          ]
        }
        myChart.setOption(option)
      }, 'xml')
    },
    mountedArea () {
      window.echarts.dispose(document.getElementById('main'))
      var myChart = window.echarts.init(document.getElementById('main'))
      var uploadedDataURL = 'http://115.159.56.191/map_data_bachelor'
      myChart.showLoading()
      $.getJSON(uploadedDataURL, function (linedata) {
        myChart.hideLoading()
        var latlong = linedata['latlong']
        var mapData = linedata['mapData']
        var max = -Infinity
        var min = Infinity
        mapData.forEach(function (itemOpt) {
          if (itemOpt.value > max) {
            max = itemOpt.value
          }
          if (itemOpt.value < min) {
            min = itemOpt.value
          }
        })
        var option = {
          backgroundColor: '#404a59',
          title: {
            text: '强化学习方向学者学校分布情况',
            left: 'center',
            top: 'top',
            textStyle: {
              color: '#fff'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
              var value = (params.value + '').split('.')
              value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,') + '.' + value[1]
              return params.seriesName + '<br/>' + params.name + ' : ' + value
            }
          },
          visualMap: {
            show: false,
            min: 0,
            max: max,
            inRange: {
              symbolSize: [6, 60]
            }
          },
          geo: {
            name: '强化学习方向学者学校分布情况',
            type: 'map',
            map: 'world',
            roam: true,
            aspectScale: '0.75',
            // left: '0px'
            // layoutSize: '100%',
            label: {
              emphasis: {
                show: false
              }
            },
            itemStyle: {
              normal: {
                areaColor: '#323c48',
                borderColor: '#111'
              },
              emphasis: {
                areaColor: '#2a333d'
              }
            }
          },
          series: [{
            type: 'scatter',
            coordinateSystem: 'geo',
            data: mapData.map(function (itemOpt) {
              return {
                name: itemOpt.name,
                value: [
                  latlong[itemOpt.code].longitude,
                  latlong[itemOpt.code].latitude,
                  itemOpt.value
                ],
                label: {
                  emphasis: {
                    position: 'right',
                    show: true
                  }
                },
                itemStyle: {
                  normal: {
                    color: itemOpt.color
                  }
                }
              }
            })
          }]
        }
        if (option && typeof option === 'object') {
          myChart.setOption(option, true)
        }
      })
      console.log(myChart.getWidth())
    },
    mountedTeachInfos (teacherName) {
      this.axios.post('http://115.159.56.191/scholar_profile', {name: teacherName}).then((response) => {
        this.teachInfos = response.data
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  html, body, #main {
    width: 100%;
    height: 600px;
    margin: 0
  }
  body { 
    padding-bottom: 70px; 
  }
  ul {
    padding-left: 0px;
  }
  ul.simple-links-container {
    padding-left: 72px;
  }
  .list-group-item {
    margin-bottom: 3px
  }
  div#panelbody {
    padding-top: 0px;
    padding-bottom: 0px;
  }
  nav.pages {
    width: 200px;
  }
</style>
