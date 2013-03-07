requirejs.config({
    baseUrl: 'js'
});

requirejs(['lib/jquery', 'lib/knockout'], function ($, ko) {
    var Slide = (function () {
        function Slide(options) {
            this.Parent = options.Parent;
            this.Id = options.Id;
            this.Active = ko.computed(function () {
                return this.Id === this.Parent.CurrentSlideId();
            }, this);
            this.Content = options.Content;
        }

        return Slide;
    })();

    var Project = (function () {
        function Project() {
            // constructor
        }

        return Project;
    })();

    var PageViewModel = (function () {
        function PageViewModel(options) {
            this.CurrentSlideId = ko.observable(0);
            this.Slides = ko.observableArray();
            this.CurrentSlideIndex = ko.computed(function () {
                var currentIndex = null, currentId  = this.CurrentSlideId(), slides = this.Slides();
                $.each(slides, function (index, slide) {
                    if (slide.Id === currentId) {
                        currentIndex = index;
                    }
                });
                return currentIndex;
            }, this);
        }
        PageViewModel.prototype.load = function (files) {
            var fileDependencies = $.map(files, function (file) {
                return 'lib/text!' + file;
            });
            var self = this;
            requirejs(fileDependencies, function () {
                var slides = [];
                for (var i = 0; i < arguments.length; i++) {
                    slides.push(new Slide({
                        Parent: self,
                        Id: i,
                        Content: arguments[i]
                    }));
                }
                self.Slides(slides);
            });
            PageViewModel.prototype.handleKeys = function (event) {
                if (event.keyCode == 37) {
                    this.prev();
                }
                if (event.keyCode == 39) {
                    this.next();
                }
            };
            PageViewModel.prototype.next = function () {
                var slides = this.Slides(), currentIndex = this.CurrentSlideIndex();
                if (currentIndex < slides.length - 1) {
                    this.CurrentSlideId(slides[currentIndex + 1].Id);
                }
            };
            PageViewModel.prototype.prev = function () {
                var slides = this.Slides(), currentIndex = this.CurrentSlideIndex();
                if (currentIndex > 0) {
                    this.CurrentSlideId(slides[currentIndex - 1].Id);
                }
            };
        };
        return PageViewModel;
    })();

    var pageModel = new PageViewModel();
    pageModel.load(['slides/1.html', 'slides/2.html', 'slides/3.html', 'slides/4.html']);
    ko.applyBindings(pageModel);

    $(document).keydown(pageModel.handleKeys.bind(pageModel));
});