package protos

type ProtoOrganism struct {
	IntrinsicAttributes []*ProtoAttribute
}

func NewProtoOrganism() *ProtoOrganism {
	return &ProtoOrganism{make([]*ProtoAttribute, 0)}
}
