// A thingy to handle the sections ----------------------------------------------
// ------------------------------------------------------------------------------
function Sections(page) {
    this.page = page;
    this.init();
}

Sections.prototype = {
    init: function(attribute) {
        this.heights = this.page.nav.find('ul').map(function(idx, ele) {
            return $(this).outerHeight();

        }).get();

        this.links = {
            next: $('#nav_next_section'),
            prev: $('#nav_prev_section')
        };
    },

    map: function() {
        this.names = $('section [id]').map(function(idx, ele) {
            return {
                id: this.id.replace('.intro', ''),
                offset: $(this).offset().top - 20,
                title: $(this).find(':header:first').text()
            };

        }).get();
    },

    highlight: function() {
        var scroll = this.page.window.scrollTop(),
            articleID = this.names[this.names.length - 1].id;

        for(var i = 0, l = this.names.length; i < l; i++) {
            if (this.names[i].offset > scroll) {
                articleID = this.names[i - 1].id;
                break;
            }
        }

        var sectionID = articleID.split('.')[0],
            page = this.page,
            nav = page.nav;

        if (sectionID !== page.section) {
            nav.filter('.nav_' + page.section).removeClass('active');
            nav.filter('.nav_' + sectionID).addClass('active');

            this.expand(sectionID);
            page.section = sectionID;
        }

        if (articleID !== page.article) {
            nav.find('a[href=#' + page.article + ']').removeClass('active');
            nav.find('a[href=#' + articleID + ']').addClass('active');

            page.article = articleID;
            this.mobile(articleID);
        }
    },

    expand: function (sectionName) {
        var nav = this.page.nav,
            index = nav.find('a[href=#' + sectionName + ']')
                       .closest('nav > ul > li').index();

        var height = this.page.window.height()
                     - $('nav > div').height()
                     - (33 * this.heights.length),

                     sections = [],
                     currentHeight = 0,
                     distance = 0;

        while ((currentHeight + this.heights[index]) < height) {
            sections.push(index);
            currentHeight += this.heights[index];

            distance = -distance + (distance >= 0 ? -1 : 1);
            index += distance;

            if (index < 0 || index >= this.heights.length) {
                distance = -distance + (distance >= 0 ? -1 : 1);
                index += distance;
            }
        }

        for(var i = 0, len = nav.length; i < len; i++) {
            if ($.inArray(i, sections) === -1) {
                nav.eq(i).find('ul').slideUp();

            } else {
                nav.eq(i).find('ul').slideDown();
            }
        }
    },

    mobile: function(index){
        for(var i = 0; i < this.names.length; i++) {
            if (this.names[i].id === index) {
                this.updateLinks(i);
                break;
            }
        }
    },

    updateLinks: function(index) {
        if (index !== this.names.length - 1) {
            this.setLink(this.links.next, this.names[index + 1]);
        } else {
            this.links.next.slideUp(100);
        }

        if (index !== 0) {
            this.setLink(this.links.prev, this.names[index - 1]);
        } else {
            this.links.prev.slideUp(100);
        }
    },

    setLink: function(ele, data) {
        ele.slideDown(100).attr('href', '#' + data.id)
                       .find('.nav_section_name').text(data.title);
    }
};


// This more or less controls the page ------------------------------------------
// ------------------------------------------------------------------------------
function Page() {
    this.window = $(window);
    this.nav = $('nav > ul > li');
    this.sections = new Sections(this);
    this.section = null;
    this.article = null;
    this.init();
}

Page.prototype = {
    init: function() {
        var that = this;

        this.scrollLast = 0;
        this.window.scroll(function() {
            that.onScroll();
        });

        this.resizeTimeout = null;
        this.window.resize(function() {
            that.onResize();
        });

        that.sections.map();
        setTimeout(function() {
            that.sections.highlight();

        }, 10);

        // Mobile, for position: fixed
        if ($.mobile) {
            $('#nav_mobile').css('position', 'absolute');
            this.window.scroll(function(){
                $('#nav_mobile').offset({
                    top: that.window.scrollTop()
                });
            });
        }
    },

    onScroll: function() {
        if ((+new Date()) - this.scrollLast > 50) {
            this.scrollLast = +new Date();
            this.sections.highlight();
        }
    },

    onResize: function() {
        clearTimeout(this.resizeTimeout);

        var that = this;
        this.resizeTimeout = setTimeout(function() {
            that.sections.map();
            that.sections.expand(that.section);

        }, 50);
    }
};

var Garden = new Page();
prettyPrint();

// GA tracking code
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-20768522-1']);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

