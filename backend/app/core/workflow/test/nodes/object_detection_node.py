from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, field_validator
# from ultralytics import YOLO

from ..base_node import BaseNode, BaseNodeConfig, NodeType


class ObjectDetectionConfig(BaseNodeConfig):
    type: NodeType = Field(NodeType.OBJECT_DETECTION, frozen=True)
    params: Dict[str, Any] = Field(...)

    class Params(BaseModel):
        model: str = Field(..., description="Model path is required")
        confidence_threshold: Optional[float] = Field(
            default=0.5, description="Confidence threshold"
        )

    @field_validator("params")
    def validate_params(cls, v):
        return cls.Params(**v).model_dump()


class ObjectDetectionNode(BaseNode):
    def work(self, state: Any) -> Any:
        self.print_log("开始执行")
        model_path = self.params.get("model", "yolov8n.pt")
        confidence_threshold = self.params.get("confidence_threshold", 0.5)

        self.print_log(f"尝试加载模型: {model_path}")

        try:
            model = model_path
        except Exception as e:
            self.print_log(f"加载模型失败: {str(e)}")
            state.data[f"detection_results_{self.node_id}"] = None
            return state

        self.print_log(f"成功加载模型 {model_path}, 置信阈值 {confidence_threshold}")

        input_node = self.get_input_node()
        if input_node is None:
            self.print_log("No input node found")
            return state

        input_images = state.data.get(f"processed_images_{input_node}", [])
        if not input_images:
            input_images = state.data.get(f"images_{input_node}", [])

        self.print_log(f"处理 {len(input_images)} 个输入")

        results = []
        for img in input_images:
            try:
                # detections = model(img, conf=confidence_threshold, save=False)
                detections = ["fake_detection"]
                results.append(detections)
            except Exception as e:
                self.print_log(f"处理输入时出错: {str(e)}")

        self.print_log("执行完成")
        state.data[f"detection_results_{self.node_id}"] = results
        return state
