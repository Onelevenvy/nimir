"use client";
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Box } from "@chakra-ui/react";
import type { Annotation } from "@/types/Annotation";
import type { ToolType } from "@/types/ToolType";
import type { Label } from "@/types/Label";
import { Stage, Layer, Image, Rect, Line, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import useImage from "use-image";
import { Shortcuts } from "@/config/shortcuts";
import type { LabelmeShape, LabelmeFormat } from "@/types/LabelmeFormat";

interface CanvasProps {
  imageUrl: string;
  currentTool: ToolType;
  currentColor: string;
  currentLabel: Label | null;
  annotations: Annotation[];
  onAnnotationAdd: (annotation: Annotation) => void;
  onAnnotationModify: (annotation: Annotation) => void;
  onError: (message: string) => void;
  labels: Label[];
  onLabelSelect?: (label: Label | null) => void;
  onLabelEdit?: (label: Label) => void;
  onAddLabel?: () => void;
}

// 在文件顶部添加这个枚举
enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

const TQXCanvas = forwardRef<{ exportToLabelme: () => void }, CanvasProps>(
  (
    {
      imageUrl,
      currentTool,
      currentColor,
      currentLabel,
      annotations,
      onAnnotationAdd,
      onAnnotationModify,
      onError,
      labels,
      onLabelSelect,
      onLabelEdit,
      onAddLabel,
    },
    ref
  ) => {
    const [image] = useImage(imageUrl);
    const stageRef = useRef<any>(null);
    const layerRef = useRef<any>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentAnnotation, setCurrentAnnotation] =
      useState<Annotation | null>(null);
    const [tempPoints, setTempPoints] = useState<number[]>([]);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
    const [isNearFirstPoint, setIsNearFirstPoint] = useState(false);
    const [firstPoint, setFirstPoint] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [isAnnotationComplete, setIsAnnotationComplete] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedAnnotation, setSelectedAnnotation] =
      useState<Annotation | null>(null);
    const [selectedPointIndex, setSelectedPointIndex] = useState<number>(-1);
    const [hoveredLineIndex, setHoveredLineIndex] = useState<number>(-1);

    // 计算舞台尺寸和缩放比例
    useEffect(() => {
      // 获取父容器尺寸
      const updateSize = () => {
        const container = stageRef.current?.container()?.parentElement;
        if (!container) return;

        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }, []);

    // 当图片加载完成后计算缩放
    useEffect(() => {
      if (!image || !stageSize.width || !stageSize.height) return;

      // 计算适合容器的缩放比例
      const scaleX = stageSize.width / image.width;
      const scaleY = stageSize.height / image.height;
      const newScale = Math.min(scaleX, scaleY) * 0.9; // 留一些边距

      setScale(newScale);

      // 居中图片
      setPosition({
        x: (stageSize.width - image.width * newScale) / 2,
        y: (stageSize.height - image.height * newScale) / 2,
      });
    }, [image, stageSize]);

    // 从你的中借鉴的获取相对坐标的函数
    const getRelativePointerPosition = (e: KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return { x: 0, y: 0 };

      const pointer = stage.getPointerPosition();
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const pos = transform.point(pointer);

      return {
        x: pos.x,
        y: pos.y,
      };
    };

    // 检查两点之间的距离
    const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    // 添加标签检查函数
    const checkLabel = () => {
      if (!currentLabel) {
        onError?.("请先选择一个标签");
        return false;
      }
      return true;
    };

    // 添加键盘事件处理
    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (
          e.key.toLowerCase() === "c" &&
          currentTool === "polygon" &&
          isDrawing &&
          tempPoints.length >= 6
        ) {
         
          const finalPoints = [...tempPoints, tempPoints[0], tempPoints[1]];
          const finalAnnotation: Annotation = {
            id: Date.now(),
            type: "polygon",
            points: finalPoints,
            color: currentColor || "#FF0000",
            labelId: currentLabel?.id ?? -1,
          };
          if (currentLabel?.id) {
            onAnnotationAdd(finalAnnotation);
            setCurrentAnnotation(null);
            setTempPoints([]);
            setIsDrawing(false);
            setFirstPoint(null);
            setIsAnnotationComplete(true);
          } else {
            onError?.("请先选择一个标签");
          }
        }
      };

      window.addEventListener("keypress", handleKeyPress);
      return () => {
        window.removeEventListener("keypress", handleKeyPress);
      };
    }, [
      currentTool,
      isDrawing,
      tempPoints,
      currentColor,
      currentLabel,
      onAnnotationAdd,
      onError,
    ]);

    // 修改键盘事件处理
    useEffect(() => {
      const moveDistance = 50;

      const handleKeyDown = (e: KeyboardEvent) => {
        // 如果正在输入（比如在输入框中），不处理快捷键
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }

        const key = e.key.toLowerCase();

        // 取消标注
        if (key === Shortcuts.annotation.cancel.toLowerCase()) {
          setIsDrawing(false);
          setCurrentAnnotation(null);
          setTempPoints([]);
          setFirstPoint(null);
          setIsAnnotationComplete(false);
          return;
        }

        // 平移控制
        if (!e.ctrlKey && !e.metaKey) {
          // 确保没有按下 Ctrl/Cmd 键
          switch (key) {
            case Shortcuts.navigation.panUp:
              setPosition((prev) => ({ ...prev, y: prev.y + moveDistance }));
              break;
            case Shortcuts.navigation.panDown:
              setPosition((prev) => ({ ...prev, y: prev.y - moveDistance }));
              break;
            case Shortcuts.navigation.panLeft:
              setPosition((prev) => ({ ...prev, x: prev.x + moveDistance }));
              break;
            case Shortcuts.navigation.panRight:
              setPosition((prev) => ({ ...prev, x: prev.x - moveDistance }));
              break;
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    // 在创建标注之前检查是否有选中的标签
    const createAnnotation = (
      type: "polygon" | "rectangle",
      points: number[]
    ): Annotation | null => {
      if (!currentLabel?.id) {
        onError?.("请先选择一个标签");
        return null;
      }

      return {
        type,
        points,
        color: currentColor || "#FF0000",
        labelId: currentLabel.id,
      };
    };

    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
      const pos = getRelativePointerPosition(e);

      if (currentTool === "move" && e.evt.button === MouseButton.Left) {
        setIsDragging(true);
        return;
      }

      // 如果是编辑模式且没有选中标注，则清除选中状态
      if (currentTool === "edit") {
        if (!e.target || e.target.name() === "stage") {
          setSelectedAnnotation(null);
          setHoveredLineIndex(-1);
        }
        return;
      }

      // 在开始任何标注之前检查是否有选中标签
      if (!currentLabel?.id) {
        onError?.("请先选择一个标签");
        return;
      }

      if (e.evt.button === MouseButton.Left) {
        switch (currentTool) {
          case "rectangle": {
            if (!firstPoint) {
              // 第一次点击，设置起点并开始预览
              setFirstPoint(pos);
              setIsDrawing(true);
              const newAnnotation = createAnnotation("rectangle", [
                pos.x,
                pos.y,
                pos.x,
                pos.y,
              ]);
              if (newAnnotation) {
                setCurrentAnnotation(newAnnotation);
              }
            } else if (isDrawing) {
              // 第二次点击，完成矩形
              const finalAnnotation = createAnnotation("rectangle", [
                firstPoint.x,
                firstPoint.y,
                pos.x,
                pos.y,
              ]);
              if (finalAnnotation) {
                onAnnotationAdd(finalAnnotation);
                setFirstPoint(null);
                setCurrentAnnotation(null);
                setIsDrawing(false);
              }
            }
            break;
          }
          case "polygon": {
            e.evt.preventDefault();

            if (!isDrawing) {
              // 第一次点击，开始绘制
              const newPoints = [pos.x, pos.y];
              const newAnnotation = createAnnotation("polygon", newPoints);
              if (newAnnotation) {
                setIsDrawing(true);
                setTempPoints(newPoints);
                setFirstPoint({ x: pos.x, y: pos.y });
                setCurrentAnnotation(newAnnotation);
                setIsAnnotationComplete(false);
              }
            } else if (!isAnnotationComplete) {
              // 检查是否靠近起点
              if (isNearFirstPoint && tempPoints.length >= 6) {
                // 确保至有3个点（6个坐标）
                const finalPoints = [
                  ...tempPoints,
                  tempPoints[0],
                  tempPoints[1],
                ];
                const finalAnnotation = createAnnotation(
                  "polygon",
                  finalPoints
                );
                if (finalAnnotation) {
                  onAnnotationAdd(finalAnnotation);
                  setCurrentAnnotation(null);
                  setTempPoints([]);
                  setIsDrawing(false);
                  setFirstPoint(null);
                  setIsAnnotationComplete(true);
                }
              } else {
                // 添加新点
                const newPoints = [...tempPoints, pos.x, pos.y];
                setTempPoints(newPoints);
                const updatedAnnotation = createAnnotation(
                  "polygon",
                  newPoints
                );
                if (updatedAnnotation) {
                  setCurrentAnnotation(updatedAnnotation);
                }
              }
            }
            break;
          }
        }
      }
    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      const pos = getRelativePointerPosition(e);

      // 处理图片拖动
      if (currentTool === ("move" as ToolType) && isDragging) {
        const stage = stageRef.current;
        if (!stage) return;

        const dx = e.evt.movementX;
        const dy = e.evt.movementY;

        setPosition((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        return;
      }

      switch (currentTool) {
        case "rectangle": {
          if (firstPoint && isDrawing) {
            // 实时更新预览矩形
            setCurrentAnnotation((prev) =>
              prev
                ? {
                    ...prev,
                    points: [firstPoint.x, firstPoint.y, pos.x, pos.y],
                  }
                : null
            );
          }
          break;
        }
        case "polygon": {
          if (isDrawing && !isAnnotationComplete && tempPoints.length > 0) {
           
            // 检查是否接近起点
            if (firstPoint) {
              const distance = getDistance(
                firstPoint.x,
                firstPoint.y,
                pos.x,
                pos.y
              );
           
              setIsNearFirstPoint(distance < 20);
            }

            // 更新预览线
            setCurrentAnnotation((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                points: [...tempPoints, pos.x, pos.y],
              };
            });
          }
          break;
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    // 添加缩放处理函数
    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      const oldScale = scale;

      // 获取鼠标相对于舞台的位置
      const pointer = stage.getPointerPosition();
      const mousePointTo = {
        x: (pointer.x - position.x) / oldScale,
        y: (pointer.y - position.y) / oldScale,
      };

      // 计算新的缩放比例
      const scaleBy = 1.1;
      const newScale =
        e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

      // 限缩放范围
      const minScale = 0.1;
      const maxScale = 5;
      if (newScale < minScale || newScale > maxScale) return;

      // 更新缩放和位置
      setScale(newScale);
      setPosition({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    };

    // 修改处理标注点击事件
    const handleAnnotationClick = (annotation: Annotation) => {
      if (currentTool === "edit" && !isDrawing) {
        setSelectedAnnotation(annotation);
      }
    };

    // 处理控制点拖动
    const handlePointDragMove = (
      e: KonvaEventObject<DragEvent>,
      pointIndex: number
    ) => {
      if (!selectedAnnotation) return;

      const pos = getRelativePointerPosition(e);
      const newPoints = [...selectedAnnotation.points];
      newPoints[pointIndex * 2] = pos.x;
      newPoints[pointIndex * 2 + 1] = pos.y;

      const updatedAnnotation = {
        ...selectedAnnotation,
        points: newPoints,
      };

      setSelectedAnnotation(updatedAnnotation);
      onAnnotationModify(updatedAnnotation);
    };

    // 处理多边形线段点击，添加新点
    const handleLineClick = (
      e: KonvaEventObject<MouseEvent>,
      annotation: Annotation,
      lineIndex: number
    ) => {
      if (annotation.type !== "polygon" || !selectedAnnotation) return;

      const pos = getRelativePointerPosition(e);
      const newPoints = [...annotation.points];
      // 在线段中间插入新点
      newPoints.splice(lineIndex * 2 + 2, 0, pos.x, pos.y);

      const updatedAnnotation = {
        ...annotation,
        points: newPoints,
      };

      setSelectedAnnotation(updatedAnnotation);
      onAnnotationModify(updatedAnnotation);
    };

    // 修改渲染标注的函数，添加可点击区域
    const renderAnnotation = (annotation: Annotation) => {
      const isSelected = selectedAnnotation?.id === annotation.id;
      const isTemp = currentAnnotation?.id === annotation.id;
      const isEditMode = currentTool === "edit";

      switch (annotation.type) {
        case "rectangle": {
          if (annotation.points.length < 4) return null;
          const [x1, y1, x2, y2] = annotation.points;
          return (
            <React.Fragment key={annotation.id}>
              <Rect
                x={Math.min(x1, x2)}
                y={Math.min(y1, y2)}
                width={Math.abs(x2 - x1)}
                height={Math.abs(y2 - y1)}
                stroke={annotation.color}
                strokeWidth={isSelected ? 3 / scale : 2 / scale}
                fill={isTemp ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 0, 0, 0.2)"}
                onClick={() => handleAnnotationClick(annotation)}
                onMouseEnter={() => {
                  if (isEditMode) {
                    document.body.style.cursor = "pointer";
                  }
                }}
                onMouseLeave={() => {
                  document.body.style.cursor = "default";
                }}
              />
              {isSelected && isEditMode && (
                <>
                  {[
                    [x1, y1],
                    [x2, y1],
                    [x1, y2],
                    [x2, y2],
                  ].map((point, index) => (
                    <Circle
                      key={index}
                      x={point[0]}
                      y={point[1]}
                      radius={6 / scale}
                      fill="white"
                      stroke={annotation.color}
                      strokeWidth={2 / scale}
                      draggable
                      onDragMove={(e) => handlePointDragMove(e, index)}
                      onMouseEnter={() => {
                        document.body.style.cursor = "move";
                      }}
                      onMouseLeave={() => {
                        document.body.style.cursor = "pointer";
                      }}
                    />
                  ))}
                </>
              )}
            </React.Fragment>
          );
        }
        case "polygon": {
          const points = annotation.points;
          if (!points || points.length < 2) return null;

          return (
            <React.Fragment key={annotation.id}>
              <Line
                points={points}
                stroke={annotation.color}
                strokeWidth={isSelected ? 3 / scale : 2 / scale}
                closed={!isTemp}
                fill={isTemp ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 0, 0, 0.2)"}
                onClick={() => handleAnnotationClick(annotation)}
                onMouseEnter={() => {
                  if (isEditMode) {
                    document.body.style.cursor = "pointer";
                  }
                }}
                onMouseLeave={() => {
                  document.body.style.cursor = "default";
                }}
              />
              {isSelected && isEditMode && (
                <>
                  {/* 渲染控制点 */}
                  {Array.from({ length: points.length / 2 }).map((_, i) => (
                    <Circle
                      key={i}
                      x={points[i * 2]}
                      y={points[i * 2 + 1]}
                      radius={6 / scale}
                      fill="white"
                      stroke={annotation.color}
                      strokeWidth={2 / scale}
                      draggable
                      hitStrokeWidth={20} // 保留更大的点击区域
                      onDragMove={(e) => handlePointDragMove(e, i)}
                      onMouseEnter={() => {
                        document.body.style.cursor = "move";
                      }}
                      onMouseLeave={() => {
                        document.body.style.cursor = "pointer";
                      }}
                    />
                  ))}
                  {/* 渲染线段，用于添加新点 */}
                  {Array.from({ length: points.length / 2 - 1 }).map((_, i) => (
                    <Line
                      key={`line-${i}`}
                      points={[
                        points[i * 2],
                        points[i * 2 + 1],
                        points[i * 2 + 2],
                        points[i * 2 + 3],
                      ]}
                      stroke="transparent"
                      strokeWidth={10 / scale}
                      onMouseEnter={() => {
                        setHoveredLineIndex(i);
                        document.body.style.cursor = "crosshair";
                      }}
                      onMouseLeave={() => {
                        setHoveredLineIndex(-1);
                        document.body.style.cursor = "pointer";
                      }}
                      onClick={(e) => handleLineClick(e, annotation, i)}
                    />
                  ))}
                </>
              )}
              {hoveredLineIndex !== -1 && isSelected && isEditMode && (
                <Circle
                  x={
                    points[hoveredLineIndex * 2] +
                    (points[hoveredLineIndex * 2 + 2] -
                      points[hoveredLineIndex * 2]) /
                      2
                  }
                  y={
                    points[hoveredLineIndex * 2 + 1] +
                    (points[hoveredLineIndex * 2 + 3] -
                      points[hoveredLineIndex * 2 + 1]) /
                      2
                  }
                  radius={4 / scale}
                  fill={annotation.color}
                  opacity={0.6}
                />
              )}
            </React.Fragment>
          );
        }
      }
    };

    // 在工具切换时重置选中状态
    useEffect(() => {
      setSelectedAnnotation(null);
      setSelectedPointIndex(-1);
      setHoveredLineIndex(-1);
    }, [currentTool]);

    const exportToLabelme = () => {
      if (!image) return null;

      // 转换标注数据
      const shapes: LabelmeShape[] = annotations.map((annotation) => {
        const label = labels.find((l) => l.id === annotation.labelId);
        const points: number[][] = [];

        // 转换点坐标格式
        for (let i = 0; i < annotation.points.length; i += 2) {
          points.push([annotation.points[i], annotation.points[i + 1]]);
        }

        return {
          label: label?.name || "unknown",
          points: points,
          group_id: null,
          shape_type: annotation.type === "rectangle" ? "rectangle" : "polygon",
          flags: {},
        };
      });

      // 创建 Labelme 格式的数据
      const labelmeData: LabelmeFormat = {
        version: "5.1.1",
        flags: {},
        shapes: shapes,
        imagePath: imageUrl.split("/").pop() || "",
        imageData: null,
        imageHeight: image.height,
        imageWidth: image.width,
      };

      return JSON.stringify(labelmeData);
    };

    // 暴露 exportToLabelme 方法给父组件
    useImperativeHandle(ref, () => ({
      exportToLabelme,
    }));

    return (
      <Box position="relative" width="100%" height="100%">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel} // 添加滚轮事件处理
          onContextMenu={(e) => e.evt.preventDefault()}
          scaleX={scale} // 应用缩放
          scaleY={scale}
          x={position.x} // 应用位置
          y={position.y}
        >
          <Layer>
            {image && <Image image={image} alt="Annotation canvas" />}
          </Layer>
          <Layer ref={layerRef}>
            {annotations.map(renderAnnotation)}
            {currentAnnotation && renderAnnotation(currentAnnotation)}
          </Layer>
        </Stage>
      </Box>
    );
  }
);
TQXCanvas.displayName = "tqxCanvas";
export default TQXCanvas;
