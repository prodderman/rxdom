import { template as _$template } from '@frp/runtime';
import { addEventListener as _$addEventListener } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(
  `<div id="main"><button>Click</button><button>Click</button><button>Click</button><button>Click</button><button>Click</button><button>Click Delegated</button><button>Click Delegated</button><button>Click Delegated</button><button>Click Delegated</button><button>Click Delegated</button><button>Click Capture</button></div>`,
  24
);
function hoisted1() {
  console.log('hoisted');
}
const hoisted2 = () => console.log('hoisted delegated');
const template = (() => {
  const _div = _tmpl$.cloneNode(true),
    _button = _div.firstChild,
    _button2 = _button.nextSibling,
    _button3 = _button2.nextSibling,
    _button4 = _button3.nextSibling,
    _button5 = _button4.nextSibling,
    _button6 = _button5.nextSibling,
    _button7 = _button6.nextSibling,
    _button8 = _button7.nextSibling,
    _button9 = _button8.nextSibling,
    _button10 = _button9.nextSibling,
    _button11 = _button10.nextSibling;
  _button.addEventListener('change', () => console.log('bound'), false);
  _$addEventListener('change', handler, false);
  _button5.addEventListener('change', hoisted1, false);
  _button6.addEventListener('click', () => console.log('click'), false);
  _$addEventListener('click', handler, false);
  _button10.addEventListener('click', hoisted2, false);
  _button11.addEventListener('click', () => console.log('listener'), true);
  return _div;
})();