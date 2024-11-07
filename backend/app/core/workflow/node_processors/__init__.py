# backend/app/core/workflow/node_processors/__init__.py

from .image_source_processor import ImageSourceNodeProcessor
from .preprocess_processor import PreprocessNodeProcessor
from .object_detection_processor import ObjectDetectionNodeProcessor
from .instance_segmentation_processor import InstanceSegmentationNodeProcessor
from .semantic_segmentation_processor import SemanticSegmentationNodeProcessor

NODE_PROCESSORS = {
    "image_source": ImageSourceNodeProcessor,
    "preprocess": PreprocessNodeProcessor,
    "object_detection": ObjectDetectionNodeProcessor,
    "instance_segmentation": InstanceSegmentationNodeProcessor,
    "semantic_segmentation": SemanticSegmentationNodeProcessor
}