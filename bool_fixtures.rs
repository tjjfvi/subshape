use crate::make_fixture_getter;

make_fixture_getter!(bool, js_sys::Boolean::from, true, false);
