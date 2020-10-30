
const APiUrl = "";
const ApiKey = ""; // replace with NYT API key 
const SECTIONS = "home, arts, automobiles, books, business, fashion, food, health, insider, magazine, movies, national, nyregion, obituaries, opinion, politics, realestate, science, sports, sundayreview, technology, theater, tmagazine, travel, upshot, world";

function buildUrl(url) {
  return 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/nytimes-api.json';
}

Vue.component('data-list', {
  props: ['results'],
  template:'#my-template',
  computed: {
    processedPosts() {
      let posts = this.results;
      return posts;
    }
  }
});
const vm = new Vue({
  el: '#app',
  data: {
    results: [{
		  fname:'',
		  lname:'',
		  email:''
	  }],
    sections: SECTIONS.split(', '), // create an array of the sections
    section: 'home', // set default section to 'home'
    loading: true,
    title: ''
  },
 
  methods: {
    getPosts(section) {
      let url = buildUrl(section);
      /*axios.get(url).then((response) => {
        this.loading = false;
		let results =  [{
		  fname:'Scott',
		  lname:'Whitsitt',
		  email:'scott.whitsitt@1to1service.com'
	    }];
        this.results = results;
        let title = this.section !== 'home' ? "Top stories in '" + this.section + "' today" : "Top stories today";
        this.title = title + "(" + response.data.num_results + ")";
      }).catch((error) => {
        console.log(error);
      });*/
	  
	  let results =  [{
		  fname:'Scott',
		  lname:'Whitsitt',
		  email:'scott.whitsitt@1to1service.com'
	  }];
	  this.results = results;
        
    }
  }
});