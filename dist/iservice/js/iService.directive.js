
var iServiceDirective = angular.module('iService.directive', []);
iServiceDirective.directive('pasteTarget', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var PollSelection = function () {
        if (elementContainsSelection(element[0]) == false) return;
        scope.$apply(attrs.pasteTarget);
        $timeout(PollSelection, 100);
      };
      element.bind('focus', function () {
        $timeout(PollSelection);
      });
    }
  };
}).directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
}).directive('asyncImageButton', function () {
  return {
    restrict: 'A',
    scope: {
      Tooltip: '&tooltip',
      Click: '&click',
      Running: '&running',
      RootPath: '&rootPath'
    },
    template: '<button type="button" class="async-image-button" ng-click="Click()" ng-disabled="Running()">' +
                '<img ng-src="{{RootPath()}}images/nothing.png" alt="{{ Tooltip() }}" title="{{ Tooltip() }}">' +
                '<div grey-out ng-show="Running()"></div>' +
              '</button>'
  };
}).directive('greyOut', function () {
  return {
    restrict: 'A',
    template: '<div class="cover-button"><div class="grey-out"></div></div>'
  };
}).directive('contenteditable', ['$sce', function ($sce) {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, element, attrs, ngModel) {
      if (!ngModel) return;
      ngModel.$render = function () {
        element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
      };
      element.on('blur keyup change', function () {
        scope.$apply(read);
      });
      function read() {
        var html = element.html();
        if (attrs.stripBr && html == '<br>') {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
    }
  };
} ]).directive('checklistModel', ['$parse', '$compile', function ($parse, $compile) {
  //http://vitalets.github.io/checklist-model/checklist-model.js
  function contains(arr, item, comparator) { if (angular.isArray(arr)) { for (var i = arr.length; i--; ) { if (comparator(arr[i], item)) { return true; } } } return false; }
  function add(arr, item, comparator) { arr = angular.isArray(arr) ? arr : []; if (!contains(arr, item, comparator)) { arr.push(item); } return arr; }
  function remove(arr, item, comparator) { if (angular.isArray(arr)) { for (var i = arr.length; i--; ) { if (comparator(arr[i], item)) { arr.splice(i, 1); break; } } } return arr; }
  function postLinkFn(scope, elem, attrs) {
    $compile(elem)(scope);
    var getter = $parse(attrs.checklistModel);
    var setter = getter.assign;
    var checklistChange = $parse(attrs.checklistChange);
    var value = $parse(attrs.checklistValue)(scope.$parent);
    var comparator = angular.equals;
    if (attrs.hasOwnProperty('checklistComparator')) {
      comparator = $parse(attrs.checklistComparator)(scope.$parent);
    }
    scope.$watch('checked', function (newValue, oldValue) {
      if (newValue === oldValue) { return; }
      var current = getter(scope.$parent);
      if (newValue === true) {
        setter(scope.$parent, add(current, value, comparator));
      } else {
        setter(scope.$parent, remove(current, value, comparator));
      }
      if (checklistChange) {
        checklistChange(scope);
      }
    });
    function setChecked(newArr, oldArr) {
      scope.checked = contains(newArr, value, comparator);
    }
    if (angular.isFunction(scope.$parent.$watchCollection)) {
      scope.$parent.$watchCollection(attrs.checklistModel, setChecked);
    } else {
      scope.$parent.$watch(attrs.checklistModel, setChecked, true);
    }
  }
  return {
    restrict: 'A',
    priority: 1000,
    terminal: true,
    scope: true,
    compile: function (tElement, tAttrs) {
      tElement.removeAttr('checklist-model');
      tElement.attr('ng-model', 'checked');
      return postLinkFn;
    }
  };
} ]);

CKEDITOR.replaceClass = null;
CKEDITOR.disableAutoInline = true;
var noBuiltinCkeditor = false;
iServiceDirective.directive('ckeditor', ['$timeout', '$window', function ($timeout, $window) {
  return {
    require: '?ngModel',
    link: function ($scope, elm, attr, ngModel) {
      if (noBuiltinCkeditor) return;
      var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

      if (isChrome) loadPasteImages();

      var options = {
        toolbar: 'full',
        toolbar_full: [
          { name: 'basic', items: ['Bold', 'Italic', 'Underline', 'RemoveFormat'] },
          { name: 'block', items: ['NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
          { name: 'style', items: ['Format', 'Font', 'FontSize', 'TextColor', 'BGColor'] },
          { name: 'insert', items: ['Table', 'HorizontalRule', 'SpecialChar', 'Link'] },
          { name: 'editor', items: ['Maximize', 'Source'] }
        ],
        removePlugins: 'resize,elementspath',
        toolbarCanCollapse: true,
        toolbarStartupExpanded: true,
        width: '100%'
      };

      if (CKEDITOR.instances[attr.id]) {
        try {
          CKEDITOR.instances[attr.id].destroy(true);
        }
        catch (ex) { }
      }
      if (CKEDITOR.instances[attr.id]) {
        delete CKEDITOR.instances[attr.id];
      }

      var createdEditor, firstVal;
      function FirstValue(v) {
        firstVal = v;
        if (createdEditor) createdEditor.setData(firstVal);
      }
      function EditorReady(e) {
        createdEditor = e;
        if (firstVal !== undefined) createdEditor.setData(firstVal);
      }

      var stopWatchForInitial = $scope.$watch(function () {
        return ngModel.$modelValue;
      },
      function (newval, oldval) {
        if (newval === undefined) return;
        stopWatchForInitial();
        FirstValue(newval);
      });

      $timeout(function () {
        CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
        if (isChrome) CKEDITOR.config.extraPlugins = 'pastebase64';
        CKEDITOR.config.entities_additional = '';
        CKEDITOR.config.contentsCss = rootPath + 'css/ckeditor.css';
        CKEDITOR.config.extraAllowedContent = 'img[alt,!src]{width,height}';
        CKEDITOR.config.disableNativeSpellChecker = false;
        var ck = CKEDITOR.replace(attr.id, options);

        ck.on('instanceReady', function () {
          ck.resize('100%', $window.getComputedStyle(elm[0]).height, true);
          EditorReady(ck);
          ngModel.$render = function (value) {
            ck.setData(ngModel.$modelValue);
          };
          ck.on('change', function () {
            $timeout(function () {
              ngModel.$setViewValue(ck.getData());
            }, 0);
          });
          if (isFirefox) {
            this.commands.maximize.on('exec', function (evt) {
              if (evt.sender.state === CKEDITOR.TRISTATE_ON) {
                $timeout(function () {
                  $('body').removeAttr('contenteditable');
                  refreshCursor(CKEDITOR.instances[elm.attr('id')]);
                }, 0);
              } else {
                $timeout(function () {
                  $('body').attr('contenteditable', true);
                  refreshCursor(CKEDITOR.instances.Body);
                }, 0);
              }
            });
          }
        });
      });

      function loadPasteImages() {
        var loc = window.location;
        var pathname = loc.pathname;
        var dir = loc.origin + pathname.substring(0, pathname.lastIndexOf('/') + 1) + rootPath + 'js/pastebase64.js';
        CKEDITOR.plugins.addExternal('pastebase64', dir, '');
      }
      function refreshCursor(editor) {
        if (editor.focusManager.hasFocus) {
          var focusGrabber = editor.container.append(CKEDITOR.dom.element.createFromHtml(
                        '<span tabindex="-1" style="position:absolute; left:-10000" role="presentation"></span>'));
          focusGrabber.on('focus', function () {
            editor.focus();
          });
          focusGrabber.focus();
          focusGrabber.remove();
        }
      }
    }
  };
} ]).directive('noCkeditor', ['$interval', function ($interval) {
  return {
    restrict: 'A',
    link: function ($scope, el, attr) {
      var ckInstance = el.attr('id');
      var interval = $interval(function () {
        if (CKEDITOR.instances[ckInstance] && CKEDITOR.instances[ckInstance].loaded) {
          CKEDITOR.instances[ckInstance].destroy();
          el[0].contentEditable = true;
          $interval.cancel(interval);
        }
      }, 30)
    }
  }
} ]).directive('bindHtmlCompile', ['$compile', function ($compile) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch(function () {
        return scope.$eval(attrs.bindHtmlCompile);
      }, function (value) {
        element.html(value && value.toString());
        var compileScope = scope;
        if (attrs.bindHtmlScope) {
          compileScope = scope.$eval(attrs.bindHtmlScope);
        }
        $compile(element.contents())(compileScope);
      });
    }
  };
}]).directive('iserviceCursorPosition', function () {
  return {
    restrict: 'A',
    scope: {
      selectionStart: '=',
      selectionEnd: '='
    },
    link: function (scope, element, attrs) {
      var currentSelectionStart,
        currentSelectionEnd;

      function applyExpression(scope) {
        scope.selectionStart = currentSelectionStart;
        scope.selectionEnd = currentSelectionEnd;
      }

      element.on('keyup mouseup touchend', function () {
        currentSelectionStart = this.selectionStart;
        currentSelectionEnd = this.selectionEnd;

        scope.$apply(applyExpression);
      });

      scope.selectionStart = element[0].selectionStart;
      scope.selectionEnd = element[0].selectionEnd;
    }
  };
}).filter('htmlencode', function () {
  return function (input) {
    input = input || '';
    return htmlEscape(input);
  };
}).directive('iserviceFocus', function () {
  return {
    restrict: 'A',
    link: function (scope, element)
    {
      element.focus();
    }
  };
  }).directive('adminLteTree', [function () {
    return {
      restrict: 'A',
      link: function (scope, element, attributes)
      {
        element.tree();
      }
    };
  }]).directive('input', function ($timeout)
  {
    var checkBoxOptions = {
      checkboxClass: 'icheckbox_square-blue'
    },
      radioOptions = {
        radioClass: 'iradio_square-blue'
      };

    return {
      restrict: 'E',
      link: function ($scope, elem, attr)
      {
        switch(attr.type)
        {
          case 'checkbox':
            elem.iCheck(checkBoxOptions);

            break;

          case 'radio':
            elem.iCheck(radioOptions);

            break;
        }
      }
    };
  });
