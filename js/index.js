requirejs.config({
    baseUrl: 'js'
});

requirejs(['lib/jquery', 'lib/knockout'], function ($, ko) {
    var Slide = (function () {
        function Slide(options) {
            this.Parent = options.Parent;
            this.Index = options.Index;
            this.Active = ko.computed(function () {
                return this.Index === this.Parent.CurrentSlideIndex();
            }, this);
            this.Content = options.Content;
        }

        return Slide;
    })();

    var Project = (function () {
        function Project(options) {
            this.Parent = options.Parent;
            this.Name = options.Name;
            this.Active = ko.computed(function () {
                return this.Name === this.Parent.CurrentProjectName();
            }, this);
            this.CurrentSlideIndex = ko.observable(0);
            this.Slides = ko.observableArray();
            this.loadSlides(options.Slides);
        }
        Project.prototype.select = function () {
            this.Parent.CurrentProjectName(this.Name);
        };
        Project.prototype.nextSlide = function () {
            var currentIndex = this.CurrentSlideIndex();
            if (currentIndex < this.Slides().length - 1) {
                this.CurrentSlideIndex(currentIndex + 1);
            }
        };
        Project.prototype.prevSlide = function () {
            var currentIndex = this.CurrentSlideIndex();
            if (currentIndex > 0) {
                this.CurrentSlideIndex(currentIndex - 1);
            }
        };
        Project.prototype.loadSlides = function (files) {
            var fileDependencies = $.map(files, function (file) {
                return 'lib/text!' + file;
            });
            var self = this;
            requirejs(fileDependencies, function () {
                var slides = [];
                for (var i = 0; i < arguments.length; i++) {
                    slides.push(new Slide({
                        Parent: self,
                        Index: i,
                        Content: arguments[i]
                    }));
                }
                self.Slides(slides);
            });
        };
        return Project;
    })();

    var PageViewModel = (function () {
        function PageViewModel(options) {
            this.Projects = ko.observableArray();
            this.CurrentProjectName = ko.observable();
            this.CurrentProject = ko.computed(function () {
                var projects = this.Projects(), currentProjectName = this.CurrentProjectName();
                var filteredProjects = $.grep(projects, function (project) {
                    return project.Name === currentProjectName;
                });
                if (filteredProjects.length > 0) {
                    return filteredProjects[0];
                }
                return null;
            }, this);
        }
        PageViewModel.prototype.handleKeys = function (event) {
            if (event.keyCode === 37) {
                this.CurrentProject().prevSlide();
            }
            if (event.keyCode === 39) {
                this.CurrentProject().nextSlide();
            }
        };
        PageViewModel.prototype.loadProjects = function (projectDefs) {
            var self = this;
            var projects = $.map(projectDefs, function (projectDef) {
                return new Project({
                    Parent: self,
                    Name: projectDef.Name,
                    Slides: projectDef.Slides
                });
            });
            this.Projects(projects);
            if (projects.length > 0) {
                projects[0].select();
            }
        };
        return PageViewModel;
    })();

    var pageModel = new PageViewModel();
    pageModel.loadProjects([
        {
            Name: "Pr1",
            Slides: ['slides/pr1/1.html', 'slides/pr1/2.html', 'slides/pr1/3.html', 'slides/pr1/4.html']
        }
    ]);
    ko.applyBindings(pageModel);

    $(document).keydown(pageModel.handleKeys.bind(pageModel));
});