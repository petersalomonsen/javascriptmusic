(module
  (type $t0 (func (param i32 i32) (result i32)))
  (func $add (export "add") (type $t0) (param $lhs i32) (param $rhs i32) (result i32)
    get_local $lhs
    get_local $rhs
    i32.add))
