import express from "express";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { protect, Req } from "../middleware/auth";
import { DigramingMessage } from "../types/digramingMsg";

const router = express.Router();

/**
 * 流程图列表
 */
router.get("/", protect, async (req: Req, res) => {
  try {
    const list = await prisma.chart.findMany({
      where: {
        ownerId: req.user.id,
        deleted: false,
      },
      select: {
        id: true,
        title: true,
        lastModify: true,
      },
    });

    res.json({
      list,
    });
  } catch (error) {
    console.log(error);
  }
});
/**
 * 新建流程图
 */
router.post("/create", protect, async (req: Req, res) => {
  const { title } = req.body as Prisma.ChartCreateInput;
  const result = await prisma.chart.create({
    data: {
      title,
      elements: {},
      page: {
        backgroundColor: "255,255,255",
        gridSize: 15,
        height: 1500,
        padding: 20,
        showGrid: true,
        width: 1050,
      },
      owner: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  res.json(result);
});
/**
 * 删除流程图
 */
router.post("/remove", protect, async (req: Req, res) => {
  const { id } = req.body as Prisma.ChartCreateInput;
  try {
    const result = await prisma.history.deleteMany({
      where: {
        chartId: id,
      },
    });

    const updated = await prisma.chart.update({
      where: {
        id: id,
      },
      data: {
        deleted: true,
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.json({ error: true, message: error });
  }
});
/**
 * 流程图详情
 */
router.get("/getdef", protect, async (req: Req, res) => {
  try {
    const id = req.query.id as string;
    const result = await prisma.chart.findUnique({
      where: {
        id,
      },
      select: {
        comments: {
          select: {
            id: true,
            shapeId: true,
            content: true,
            userId: true,
            name: true,
            time: true,
          },
        },
        title: true,
        page: true,
        elements: true,
        theme: true,
      },
    });

    res.json({
      def: JSON.stringify(result),
    });
  } catch (error) {
    res.json({ error: true, message: error });
  }
});
/**
 * 流程图操作生成历史
 */
router.post("/msg", protect, async (req: Req, res) => {
  const { msgStr, chartId } = req.body;
  const userActions = JSON.parse(msgStr) as DigramingMessage.UserActions;

  let result = await prisma.chart.findUnique({
    where: {
      id: chartId,
    },
  });

  const newVersionData = await prisma.history.create({
    data: {
      remark: "自动存储",
      title: result.title,
      elements: result.elements,
      page: result.page,
      theme: result.theme ? result.theme : undefined,
      userId: req.user.id,
      chartId,
    },
  });

  for (const userAction of userActions) {
    if (userAction.action === "changeTitle") {
      result.title = userAction.title;
    }
    if (userAction.action === "command") {
      for (const message of userAction.messages) {
        if (message.action === "setTheme") {
          result.theme = message.content.update;
        }
        if (message.action === "updatePage") {
          result.page = message.content.update;
        }
        if (message.action === "create") {
          message.content.forEach((item) => {
            result.elements[item.id] = item;
          });
        }
        if (message.action === "update") {
          message.content.updates.forEach((item) => {
            result.elements[item.id] = item;
          });
        }
        if (message.action === "remove") {
          message.content.forEach((item) => {
            delete result.elements[item.id];
          });
        }
      }
    }
  }

  const updated = await prisma.chart.update({
    where: {
      id: chartId,
    },
    data: {
      title: result.title,
      elements: result.elements,
      page: result.page,
      theme: result.theme ? result.theme : undefined,
    },
  });

  res.json(updated);
});
/**
 * 手动创建历史版本
 */
router.post("/add_version", protect, async (req: Req, res) => {
  const { def, chartId, remark } = req.body;
  const saveData = JSON.parse(def) as Prisma.ChartCreateInput;

  let result = await prisma.chart.findUnique({
    where: {
      id: chartId,
    },
  });
  const newVersionData = await prisma.history.create({
    data: {
      remark,
      title: result.title,
      elements: saveData.elements,
      page: saveData.page,
      theme: saveData.theme ? saveData.theme : undefined,
      userId: req.user.id,
      chartId,
    },
  });
  res.json(newVersionData);
});
/**
 * 历史流程图详情
 */
router.get("/get_versiondef", protect, async (req: Req, res) => {
  try {
    const id = req.query.id as string;
    const result = await prisma.history.findUnique({
      where: {
        id,
      },
      select: {
        title: true,
        page: true,
        elements: true,
        theme: true,
      },
    });

    res.json({
      def: JSON.stringify(result),
    });
  } catch (error) {
    res.json({ error: true, message: error });
  }
});
/**
 * 删除历史版本
 */
router.post("/del_version", protect, async (req: Req, res) => {
  const { id } = req.body;
  const result = await prisma.history.delete({
    where: {
      id,
    },
  });
  res.json(result);
});
/**
 * 查询历史列表
 */
router.get("/get_versions", protect, async (req: Req, res) => {
  const chartId = req.query.chartId as string;
  const page = req.query.page as string;

  const result = await prisma.history.findMany({
    where: {
      chartId,
    },
    select: {
      id: true,
      createTime: true,
      chartId: true,
      user: true,
      remark: true,
    },
    orderBy: {
      createTime: "desc",
    },
    skip: (+page - 1) * 10,
    take: 10,
  });
  res.json({
    list: result,
  });
});

router.get("/watermarks", protect, async (req: Req, res) => {
  res.json({
    result: "success",
    userContext: {},
    watermarks: ["小马"],
  });
});

router.get("/chart_my_shapes", protect, async (req: Req, res) => {
  const curPage = req.query.curPage as string;
  res.json({
    result: "success",
    pageCount: 0,
    definition: [],
    curPage,
  });
});

router.get("/:id", protect, async (req: Req, res) => {
  return res.render("diagraming", {
    user: req.user,
    chartId: req.params.id,
  });
});

export default router;
