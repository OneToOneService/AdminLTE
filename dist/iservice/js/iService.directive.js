(function ()
{
  'use strict';

  var noBuiltinCkeditor = false;

  CKEDITOR.replaceClass = null;
  CKEDITOR.disableAutoInline = true;

  /**
  * @param {JQLite} document Injected document
  * @param {String} rootPath -
  * @returns {angular.IDirective<{files:Array<File>}|angular.IScope>} Directive definition
  */
  function directiveIserviceFilesUpload(document)
  {
    var documentStartEvents = 'drag dragover dragenter',
      documentEndEvents = 'dragleave dragend drop';

    function getMimeIcon(type)
    {
      switch(type)
      {
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return 'fa-file-excel-o';

        case 'application/pdf':
        case 'application/x-pdf':
        case 'application/acrobat':
        case 'applications/vnd.pdf':
        case 'text/pdf':
        case 'text/x-pdf':
          return 'fa-file-pdf-o';

        case 'audio/wav':
        case 'audio/mpeg':
        case 'audio/mp3':
        case 'audio/ogg':
        case 'application/ogg':
          return 'fa-file-audio-o';

        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return 'fa-file-word-o';

        case 'application/zip':
        case 'application/x-rar-compressed':
        case 'application/rar':
          return 'fa-file-archive-o';

        case 'image/gif':
        case 'image/png':
        case 'image/jpeg':
        case 'image/bmp':
        case 'image/svg+xml':
        case 'image/webp':
        case 'image/vnd.microsoft.icon':
          return 'fa-file-image-o';

        case 'text/plain':
        case 'text/html':
        case 'text/css':
        case 'text/javascript':
        case 'text/markdown':
          return 'fa-file-text-o';

        case 'video/webm':
        case 'video/ogg':
        case 'application/mp4':
          return 'fa-file-video-o';

        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return 'fa-file-powerpoint-o';
      }

      return 'fa-file-o';
    }

    /**
     * -
     * @param {DataTransfer} dataTransfer -
     * @returns {boolean} -
     */
    function hasFiles(dataTransfer)
    {
      // Because in IE types is a DOMStringList, and in other browsers, it's a string Array
      return dataTransfer.types.contains ? dataTransfer.types.contains('Files') :
        dataTransfer.types.indexOf('Files') >= 0;
    }

    return {
      restrict: 'E',
      templateUrl: '/resources/files-upload.html',
      scope: {
        files: '='
      },
      link: function (scope, element)
      {
        var dragging = false,
          dropZone = element.find('.drop-box'),
          fileInput = element.find('input');

        scope.deleteFile = deleteFile;
        scope.getMimeIcon = getMimeIcon;

        document.on(documentStartEvents, onDocumentDragStart);
        document.on(documentEndEvents, onDocumentDragEnd);

        dropZone.on('drag dragover dragenter ', onDragEnter);
        dropZone.on('dragleave dragend', onDragLeave);
        dropZone.on('drop', onDrop);

        fileInput.on('change', onFilesSelected);

        scope.$on('$destroy', onDestroy);

        /**
         * -
         * @param {DragEvent} e -
         */
        function onDocumentDragStart(e)
        {
          if(!hasFiles(e.originalEvent.dataTransfer))
            return;

          dragging = true;

          dropZone.addClass('drop-box_active');
        }

        function onDocumentDragEnd(e)
        {
          dragging = false;

          if(e.type !== 'dragleave' || !e.relatedTarget)
            dropZone.removeClass('drop-box_active drop-box_hover');
        }

        /**
         * -
         * @param {DragEvent} e -
         */
        function onDragEnter(e)
        {
          if(!dragging)
            return;

          e.stopPropagation();
          e.preventDefault();

          dropZone.removeClass('drop-box_active');
          dropZone.addClass('drop-box_hover');
        }

        function onDragLeave()
        {
          if(dragging)
          {
            dropZone.removeClass('drop-box_hover');

            dropZone.addClass('drop-box_active');
          }
        }

        /**
         * -
         * @param {DragEvent} e -
         */
        function onDrop(e)
        {
          var data = e.originalEvent.dataTransfer;

          if(!hasFiles(data))
            return;

          e.preventDefault();

          addFiles(data.files);

          dropZone.removeClass('drop-box_hover drop-box_active');
        }

        function onDestroy()
        {
          document.off(documentStartEvents, onDocumentDragStart);
          document.off(documentEndEvents, onDocumentDragEnd);
        }

        function onFilesSelected(e)
        {
          addFiles(e.target.files);

          fileInput.val('');
        }

        /**
         * -
         * @param {FileList} files -
         */
        function addFiles(files)
        {
          scope.$apply(function ()
          {
            Array.prototype.forEach.call(files, function (f)
            {
              scope.files.push(f);
            });
          });
        }

        function deleteFile(index)
        {
          scope.files.splice(index, 1);
        }
      }
    };
  }

  function directiveIserviceInput()
  {
    var checkBoxOptions = {
      checkboxClass: 'icheckbox_square-blue'
    },
      radioOptions = {
        radioClass: 'iradio_square-blue'
      };

    return {
      restrict: 'E',
      require: '',
      link: function ($scope, elem, attr, ngModel)
      {
        var isCheckBox = false;

        // The iservice-switch marker attribute disables this directive handling. It's used by the Switch directive
        if(attr.iserviceSwitch !== undefined)
          return;

        switch(attr.type)
        {
          case 'checkbox':
            isCheckBox = true;
            if(!elem.hasClass('defaulttype')){
                elem.iCheck(checkBoxOptions);
            }
            break;

          case 'radio':
            isCheckBox = false;

            elem.iCheck(radioOptions);

            break;

          default:
            return;
        }

        if(attr.ngClick)
        {
          elem.on('ifClicked', function ()
          {
            $scope.$apply(attr.ngClick);
          });
        }

        if(attr.ngDisabled)
        {
          attr.$observe('disabled', function (v)
          {
            v ? elem.iCheck('disable') : elem.iCheck('enable');
          });
        }

        if(ngModel)
        {
          var mereElement = elem[0],
            applyExpression;

          if(isCheckBox)
          {
            applyExpression = function ()
            {
              return ngModel.$setViewValue(mereElement.checked);
            };
          }
          else
          {
            applyExpression = function ()
            {
              var value = attr.ngValue ? $scope.$eval(attr.ngValue) : mereElement.value;

              return ngModel.$setViewValue(value);
            };
          }

          $scope.$watch(attr.ngModel, function ()
          {
            elem.iCheck('update');
          });

          elem.on('ifToggled ifIndeterminate ifDeterminate', function ()
          {
            $scope.$apply(applyExpression);
          });
        }
      }
    };
  }

  function directiveIserviceSwitch()
  {
    return {
      restrict: 'E',
      // The switched attribute is mandatory and it's what gets bound to ng-model, while The disabled attribute
      // is optional, so I made two templates to cater for that
      // iservice-switch is a marker attribute to disable our handling for check boxes
      template: function (element, attrs)
      {
        return '<label class="switch"><input type="checkbox" ng-model="' +
          attrs.switched + '" iservice-switch /><i></i><ng-transclude></ng-transclude></label>';
      },
      transclude: true
    };
  }

  angular.module('iService.directive', [])
    .directive('pasteTarget', function ($timeout)
    {
      return {
        restrict: 'A',
        link: function (scope, element, attrs)
        {
          var PollSelection = function ()
          {
            if(!elementContainsSelection(element[0])) return;
            scope.$apply(attrs.pasteTarget);
            $timeout(PollSelection, 100);
          };
          element.bind('focus', function ()
          {
            $timeout(PollSelection);
          });
        }
      };
    }).directive('ngEnter', function ()
    {
      return function (scope, element, attrs)
      {
        element.bind('keydown keypress', function (event)
        {
          if(event.which === 13)
          {
            scope.$apply(function ()
            {
              scope.$eval(attrs.ngEnter);
            });
            event.preventDefault();
          }
        });
      };
    }).directive('asyncImageButton', function ()
    {
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
    }).directive('greyOut', function ()
    {
      return {
        restrict: 'A',
        template: '<div class="cover-button"><div class="grey-out"></div></div>'
      };
    }).directive('contenteditable', ['$sce', function ($sce)
    {
      return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel)
        {
          if(!ngModel) return;
          ngModel.$render = function ()
          {
            element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
          };
          element.on('blur keyup change', function ()
          {
            scope.$apply(read);
          });
          function read()
          {
            var html = element.html();
            if(attrs.stripBr && html === '<br>')
            {
              html = '';
            }
            ngModel.$setViewValue(html);
          }
        }
      };
    }]).directive('checklistModel', ['$parse', '$compile', function ($parse, $compile)
    {
      //http://vitalets.github.io/checklist-model/checklist-model.js
      function contains(arr, item, comparator) { if(angular.isArray(arr)) { for(var i = arr.length; i--;) { if(comparator(arr[i], item)) { return true; } } } return false; }
      function add(arr, item, comparator) { arr = angular.isArray(arr) ? arr : []; if(!contains(arr, item, comparator)) { arr.push(item); } return arr; }
      function remove(arr, item, comparator) { if(angular.isArray(arr)) { for(var i = arr.length; i--;) { if(comparator(arr[i], item)) { arr.splice(i, 1); break; } } } return arr; }
      function postLinkFn(scope, elem, attrs)
      {
        $compile(elem)(scope);
        var getter = $parse(attrs.checklistModel);
        var setter = getter.assign;
        var checklistChange = $parse(attrs.checklistChange);
        var value = $parse(attrs.checklistValue)(scope.$parent);
        var comparator = angular.equals;
        if(attrs.hasOwnProperty('checklistComparator'))
        {
          comparator = $parse(attrs.checklistComparator)(scope.$parent);
        }
        scope.$watch('checked', function (newValue, oldValue)
        {
          if(newValue === oldValue) { return; }
          var current = getter(scope.$parent);
          if(newValue === true)
          {
            setter(scope.$parent, add(current, value, comparator));
          } else
          {
            setter(scope.$parent, remove(current, value, comparator));
          }
          if(checklistChange)
          {
            checklistChange(scope);
          }
        });
        function setChecked(newArr, oldArr)
        {
          scope.checked = contains(newArr, value, comparator);
        }
        if(angular.isFunction(scope.$parent.$watchCollection))
        {
          scope.$parent.$watchCollection(attrs.checklistModel, setChecked);
        } else
        {
          scope.$parent.$watch(attrs.checklistModel, setChecked, true);
        }
      }
      return {
        restrict: 'A',
        priority: 1000,
        terminal: true,
        scope: true,
        compile: function (tElement, tAttrs)
        {
          tElement.removeAttr('checklist-model');
          tElement.attr('ng-model', 'checked');
          return postLinkFn;
        }
      };
    }]).directive('ckeditor', ['$timeout', '$window', function ($timeout, $window)
    {
      return {
        require: '?ngModel',
        link: function ($scope, elm, attr, ngModel)
        {
          if(noBuiltinCkeditor) return;
          var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
          var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

          if(isChrome) loadPasteImages();

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

          if(CKEDITOR.instances[attr.id])
          {
            try
            {
              CKEDITOR.instances[attr.id].destroy(true);
            }
            catch(ex)
            {
              console.error(ex);
            }
          }
          if(CKEDITOR.instances[attr.id])
          {
            delete CKEDITOR.instances[attr.id];
          }

          var createdEditor, firstVal;
          function FirstValue(v)
          {
            firstVal = v;
            if(createdEditor) createdEditor.setData(firstVal);
          }
          function EditorReady(e)
          {
            createdEditor = e;
            if(firstVal !== undefined) createdEditor.setData(firstVal);
          }

          var stopWatchForInitial = $scope.$watch(function ()
          {
            return ngModel ? ngModel.$modelValue : null;
          },
            function (newval, oldval)
            {
              if(newval === undefined) return;
              stopWatchForInitial();
              FirstValue(newval);
            });

          var initialize = function ()
          {
            CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
            if(isChrome) CKEDITOR.config.extraPlugins = 'pastebase64';
            CKEDITOR.config.entities_additional = '';
            //CKEDITOR.config.contentsCss = rootPath + 'css/ckeditor.css';
            CKEDITOR.config.extraAllowedContent = 'img[alt,!src]{width,height}';
			CKEDITOR.config.allowedContent = true;
			CKEDITOR.config.fullPage = true;
            CKEDITOR.config.disableNativeSpellChecker = false;
			//config.disallowedContent = 'script; *[on*]';
			
			CKEDITOR.config.disallowedContent = 'script; *[on*]';
            var ck = CKEDITOR.replace(elm[0], options);
			    CKEDITOR.replace('content', {
				extraPlugins: 'font,panelbutton,colorbutton,colordialog,justify,indentblock,aparat,buyLink',
				autoGrow_onStartup: true,
				enterMode: CKEDITOR.ENTER_BR,
				FullPage : false,
				allowedContent : true,
				ProtectedTags : 'html|head|body'
			});
            ck.on('instanceReady', function ()
            {
              ck.resize('100%', 450, true);
              EditorReady(ck);

              if(ngModel)
              {
                ngModel.$render = function (value)
                {
                  ck.setData(ngModel.$modelValue);
                };
                ck.on('change', function ()
                {
                  $timeout(function ()
                  {
                    ngModel.$setViewValue(ck.getData());
                  }, 0);
                });
              }

              if(isFirefox)
              {
                this.commands.maximize.on('exec', function (evt)
                {
                  if(evt.sender.state === CKEDITOR.TRISTATE_ON)
                  {
                    $timeout(function ()
                    {
                      $('body').removeAttr('contenteditable');
                      refreshCursor(CKEDITOR.instances[elm.attr('id')]);
                    }, 0);
                  } else
                  {
                    $timeout(function ()
                    {
                      $('body').attr('contenteditable', true);
                      refreshCursor(CKEDITOR.instances.Body);
                    }, 0);
                  }
                });
              }
            });
          };

          $timeout(initialize);

          function loadPasteImages()
          {
            CKEDITOR.plugins.addExternal('pastebase64', '/dist/iservice/js/pastebase64.js', '');
          }

          function refreshCursor(editor)
          {
            if(editor.focusManager.hasFocus)
            {
              var focusGrabber = editor.container.append(CKEDITOR.dom.element.createFromHtml(
                '<span tabindex="-1" style="position:absolute; left:-10000" role="presentation"></span>'));
              focusGrabber.on('focus', function ()
              {
                editor.focus();
              });
              focusGrabber.focus();
              focusGrabber.remove();
            }
          }
        }
      };
    }]).directive('noCkeditor', ['$interval', function ($interval)
    {
      return {
        restrict: 'A',
        link: function ($scope, el, attr)
        {
          var ckInstance = el.attr('id');
          var interval = $interval(function ()
          {
            if(CKEDITOR.instances[ckInstance] && CKEDITOR.instances[ckInstance].loaded)
            {
              CKEDITOR.instances[ckInstance].destroy();
              el[0].contentEditable = true;
              $interval.cancel(interval);
            }
          }, 30);
        }
      };
    }]).directive('bindHtmlCompile', ['$compile', function ($compile)
    {
      return {
        restrict: 'A',
        link: function (scope, element, attrs)
        {
          scope.$watch(function ()
          {
            return scope.$eval(attrs.bindHtmlCompile);
          }, function (value)
            {
              element.html(value && value.toString());
              var compileScope = scope;
              if(attrs.bindHtmlScope)
              {
                compileScope = scope.$eval(attrs.bindHtmlScope);
              }
              $compile(element.contents())(compileScope);
            });
        }
      };
    }]).directive('iserviceCursorPosition', function ()
    {
      return {
        restrict: 'A',
        scope: {
          selectionStart: '=',
          selectionEnd: '='
        },
        link: function (scope, element, attrs)
        {
          var currentSelectionStart,
            currentSelectionEnd;

          function applyExpression(scope)
          {
            scope.selectionStart = currentSelectionStart;
            scope.selectionEnd = currentSelectionEnd;
          }

          element.on('keyup mouseup touchend', function ()
          {
            currentSelectionStart = this.selectionStart;
            currentSelectionEnd = this.selectionEnd;

            scope.$apply(applyExpression);
          });

          scope.selectionStart = element[0].selectionStart;
          scope.selectionEnd = element[0].selectionEnd;
        }
      };
    }).filter('htmlencode', function ()
    {
      return function (input)
      {
        input = input || '';
        return htmlEscape(input);
      };
    }).directive('iserviceFocus', function ()
    {
      return {
        restrict: 'A',
        link: function (scope, element)
        {
          element.focus();
        }
      };
    }).directive('adminLteTree', [function ()
    {
      return {
        restrict: 'A',
        link: function (scope, element, attributes)
        {
          element.tree();
        }
      };
    }]).directive('input', directiveIserviceInput)
    .directive('iserviceSwitch', directiveIserviceSwitch)
    .directive('iserviceFilesUpload', ['$document', directiveIserviceFilesUpload]);
})();